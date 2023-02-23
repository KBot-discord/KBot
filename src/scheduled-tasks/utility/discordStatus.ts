import { DISCORD_STATUS_BASE, StatusEmbed } from '#utils/constants';
import { IncidentNotification } from '#lib/structures/IncidentNotification';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from 'discord.js';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import type { StatusPageIncident, StatusPageResult } from '#lib/types/DiscordStatus';
import type { IncidentMessage } from '#prisma';

interface DatabaseIncidentData {
	updatedAt: Date | undefined;
	notifications: IncidentNotification[];
}

@ApplyOptions<ScheduledTask.Options>({
	pattern: '0 */5 * ? * *' // Every 5 minutes
})
export class DiscordStatusTask extends ScheduledTask {
	public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
		super(context, { ...options });
	}

	public override async run(): Promise<void> {
		try {
			const channelData = await this.container.utility.fetchIncidentChannels();
			if (channelData.length === 0) return;

			const { incidents } = await fetch<StatusPageResult>(
				`${DISCORD_STATUS_BASE}/incidents.json`,
				{
					method: FetchMethods.Get
				},
				FetchResultTypes.JSON
			);

			const dbIncidents = await this.container.prisma.discordIncident.findMany({
				where: { id: { in: incidents.map((incident) => incident.id) } },
				select: { id: true, updatedAt: true, messages: true }
			});

			const formattedData: { incident: StatusPageIncident; data: DatabaseIncidentData }[] = incidents.map((incident) => {
				const entry = dbIncidents.find((dbIncident) => dbIncident.id === incident.id);

				const notifications = channelData.map(({ guildId, channelId }) => {
					if (!entry) return new IncidentNotification(incident.id, guildId, channelId);

					const message = entry.messages.find((message) => message.channelId === channelId);
					return new IncidentNotification(incident.id, guildId, channelId, message);
				});

				return { incident, data: { notifications, updatedAt: entry?.updatedAt ?? undefined } };
			});

			for (const { incident, data } of formattedData.reverse()) {
				const embed = this.embedFromIncident(incident);

				if (!data.updatedAt) {
					await this.handleNotifications(incident, embed, data.notifications, true);
					continue;
				}

				const incidentUpdate = new Date(incident.updated_at ?? incident.created_at);
				if (new Date(data.updatedAt) < incidentUpdate) {
					await this.handleNotifications(incident, embed, data.notifications);
				}
			}
		} catch (error) {
			this.container.logger.error(`Error during discord incident task:\n`, error);
		}
	}

	private async handleNotifications(incident: StatusPageIncident, embed: EmbedBuilder, notifications: IncidentNotification[], newIncident = false) {
		const { prisma, utility } = this.container;

		const validNotifications: IncidentNotification[] = [];
		const invalidNotifications: IncidentNotification[] = [];

		const fetchedNotifications = await Promise.all(
			notifications.map((notification) => notification.fetchChannel()) //
		);

		for (const notification of fetchedNotifications) {
			const result = await notification.validateChannel();
			if (result === undefined) {
				invalidNotifications.push(notification);
			} else if (result) {
				validNotifications.push(notification);
			}
		}

		const sendMessageResult = await Promise.all(
			validNotifications.map((notification) => notification.sendMessage(embed)) //
		);

		await Promise.all(
			invalidNotifications.map(({ guildId }) => {
				return utility.upsertSettings(guildId, {
					incidentChannelId: null
				});
			})
		);

		if (newIncident) {
			const messages: IncidentMessage[] = sendMessageResult.map((notification) => notification.getData());

			await prisma.$transaction([
				...invalidNotifications.map(({ channelId }) => {
					return prisma.incidentMessage.deleteMany({
						where: { channelId }
					});
				}),
				prisma.discordIncident.create({
					data: {
						id: incident.id,
						resolved: incident.status === 'resolved' || incident.status === 'postmortem',
						messages: { createMany: { data: messages } }
					}
				})
			]);
		} else {
			const newNotifications: IncidentMessage[] = sendMessageResult
				.filter((result) => {
					return !result.incidentMessage && result.messageId;
				})
				.map((notification) => notification.getData());

			await prisma.$transaction([
				...invalidNotifications.map(({ channelId }) => {
					return prisma.incidentMessage.deleteMany({
						where: { channelId }
					});
				}),
				prisma.discordIncident.update({
					where: { id: incident.id },
					data: { resolved: incident.status === 'resolved' || incident.status === 'postmortem' }
				}),
				prisma.incidentMessage.createMany({ data: newNotifications })
			]);
		}
	}

	private embedFromIncident(incident: StatusPageIncident): EmbedBuilder {
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

		const affectedComponents = incident.components.map((c) => c.name);

		const embed = new EmbedBuilder()
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

		if (affectedComponents.length) {
			descriptionParts.push(`• Affected Components: ${affectedComponents.join(', ')}`);
		}

		embed.setDescription(descriptionParts.join('\n'));

		return embed;
	}
}
