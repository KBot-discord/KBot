import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { MessageEmbed, TextChannel } from 'discord.js';
import fetch from 'node-fetch';
import { DISCORD_STATUS_BASE, StatusEmbed } from '../../lib/util/constants';
import { isNullish } from '@sapphire/utilities';
import type { StatusPageIncident, StatusPageResult } from '../../lib/types/discordStatus';
import type { IncidentMessage } from '@prisma/client';

@ApplyOptions<ScheduledTask.Options>({
	pattern: '0 */5 * ? * *'
})
export class DiscordStatusTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	// TODO use redis lists?
	public override async run() {
		try {
			const channels = await container.db.utilityModule
				.findMany({
					where: { moduleEnabled: true, NOT: [{ incidentChannel: null }] },
					select: { incidentChannel: true }
				})
				.then((res) => res.map((e) => e.incidentChannel!));
			if (isNullish(channels) || channels.length === 0) return;

			const { incidents } = (await fetch(`${DISCORD_STATUS_BASE}/incidents.json`).then((res) => res.json())) as StatusPageResult;

			const formattedData = await this.mergeData(incidents);

			for (const { incident, entry } of formattedData.reverse()) {
				const embed = this.embedFromIncident(incident);

				if (!entry) {
					await this.sendMessage(incident, embed, channels, true);
					continue;
				}

				const incidentUpdate = new Date(incident.updated_at ?? incident.created_at);
				if (new Date(entry.updatedAt) < incidentUpdate) {
					const newChannels = channels.filter((ch) => !entry.messages.map((c) => c.channelId).includes(ch));

					await this.sendMessage(incident, embed, newChannels);
					await this.editMessages(incident, embed, entry.messages);
				}
			}

			for (const incident of incidents.reverse()) {
				const data = await container.db.discordIncident.findUnique({
					where: { id: incident.id },
					select: {
						id: true,
						updatedAt: true,
						messages: true
					}
				});
				const embed = this.embedFromIncident(incident);

				if (!data) {
					await this.sendMessage(incident, embed, channels, true);
					continue;
				}

				const incidentUpdate = new Date(incident.updated_at ?? incident.created_at);
				if (new Date(data.updatedAt) < incidentUpdate) {
					const newChannels = channels.filter((ch) => !data.messages.map((c) => c.channelId).includes(ch));

					await this.sendMessage(incident, embed, newChannels);
					await this.editMessages(incident, embed, data.messages);
				}
			}
		} catch (error) {
			container.logger.error(`Error during discord incident task:\n`, error);
		}
	}

	private async editMessages(incident: StatusPageIncident, embed: MessageEmbed, messages: IncidentMessage[]) {
		const invalidChannels: string[] = [];
		await Promise.all(
			messages.map(async ({ id, channelId }) => {
				const channel = (await container.client.channels.fetch(channelId).catch(() => null)) as TextChannel | null;
				if (isNullish(channel)) return invalidChannels.push(channelId);
				return channel.messages.fetch(id).then((message) => message.edit({ embeds: [embed] }));
			})
		);
		await container.db.$transaction(async (prisma) => {
			if (invalidChannels.length > 0) {
				for (const channel of invalidChannels) {
					await prisma.utilityModule.update({
						where: { incidentChannel: channel },
						data: { incidentChannel: null }
					});
					await prisma.incidentMessage.deleteMany({
						where: { channelId: channel }
					});
				}
			}
			await container.db.discordIncident.update({
				where: { id: incident.id },
				data: {
					resolved: incident.status === 'resolved' || incident.status === 'postmortem'
				}
			});
		});
	}

	private async sendMessage(incident: StatusPageIncident, embed: MessageEmbed, channels: string[], isNew = false) {
		const invalidChannels: string[] = [];
		const newMessages: IncidentMessage[] = [];

		await Promise.all(
			channels.map(async (channel) => {
				const fetchedCh = (await container.client.channels.fetch(channel).catch(() => null)) as TextChannel | null;
				if (isNullish(fetchedCh)) return invalidChannels.push(channel);
				return newMessages.push({
					id: (await fetchedCh.send({ embeds: [embed] })).id,
					channelId: fetchedCh.id,
					incidentId: incident.id
				});
			})
		);

		await container.db.$transaction(async (prisma) => {
			if (invalidChannels.length > 0) {
				for (const channel of invalidChannels) {
					await prisma.utilityModule.update({
						where: { incidentChannel: channel },
						data: { incidentChannel: null }
					});
					await prisma.incidentMessage.deleteMany({
						where: { channelId: channel }
					});
				}
			}
			if (isNew) {
				await prisma.discordIncident.create({
					data: {
						id: incident.id,
						messages: {
							createMany: {
								data: newMessages.map((m) => ({ id: m.id, channelId: m.channelId }))
							}
						},
						resolved: incident.status === 'resolved' || incident.status === 'postmortem'
					}
				});
			} else {
				await prisma.incidentMessage.createMany({ data: newMessages });
			}
		});
	}

	private async mergeData(incidents: StatusPageIncident[]) {
		const data = await container.db.discordIncident.findMany({
			where: { id: { in: incidents.map((i) => i.id) } },
			select: {
				id: true,
				updatedAt: true,
				messages: true
			}
		});
		return incidents.map((incident) => ({ incident, entry: data.find((entry) => entry.id === incident.id) }));
	}

	private embedFromIncident(incident: StatusPageIncident): MessageEmbed {
		const color =
			incident.status === 'resolved' || incident.status === 'postmortem'
				? StatusEmbed.Green
				: incident.impact === 'critical'
				? StatusEmbed.Red
				: incident.impact === 'major'
				? StatusEmbed.Orange
				: incident.impact === 'minor'
				? StatusEmbed.Yellow
				: StatusEmbed.Black;

		const affectedNames = incident.components.map((c) => c.name);

		const embed = new MessageEmbed()
			.setColor(color)
			.setTimestamp(new Date(incident.started_at))
			.setURL(incident.shortlink)
			.setTitle(incident.name)
			.setFooter({ text: incident.id });

		for (const update of incident.incident_updates.reverse()) {
			const updateDT = new Date(update.created_at);
			const timeString = `<t:${Math.floor(updateDT.getTime() / 1000)}:R>`;
			embed.addFields([{ name: `${update.status.charAt(0).toUpperCase()}${update.status.slice(1)} (${timeString})`, value: update.body }]);
		}

		const descriptionParts = [`• Impact: ${incident.impact}`];

		if (affectedNames.length) {
			descriptionParts.push(`• Affected Components: ${affectedNames.join(', ')}`);
		}

		embed.setDescription(descriptionParts.join('\n'));

		return embed;
	}
}
