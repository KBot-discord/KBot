import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { EmbedBuilder, GuildTextBasedChannel } from 'discord.js';
import type { IncidentMessage } from '@kbotdev/database';

export class IncidentNotification {
	public channel: GuildTextBasedChannel | null = null;
	public messageId: string | null = null;

	public readonly incidentId: string;
	public readonly guildId: string;
	public readonly channelId: string;
	public readonly incidentMessage: IncidentMessage | undefined;

	public constructor(incidentId: string, guildId: string, channelId: string, incidentMessage?: IncidentMessage) {
		this.incidentId = incidentId;
		this.guildId = guildId;
		this.channelId = channelId;
		this.incidentMessage = incidentMessage;
	}

	public async fetchChannel(): Promise<this> {
		this.channel = (await container.client.channels.fetch(this.channelId).catch(() => null)) as GuildTextBasedChannel | null;
		return this;
	}

	public async validateChannel(): Promise<boolean | undefined> {
		if (isNullish(this.channel)) return undefined;
		const { result } = await container.validator.channels.canSendEmbeds(this.channel);
		return result;
	}

	public async sendMessage(embed: EmbedBuilder): Promise<this> {
		if (isNullish(this.channel)) return this;

		if (isNullish(this.incidentMessage)) {
			const message = await this.channel.send({ embeds: [embed] });
			this.messageId = message.id;
		} else {
			const message = await this.channel.messages.fetch(this.incidentMessage.id);
			await message.edit({ embeds: [embed] });
		}

		return this;
	}

	public getData(): IncidentMessage {
		return {
			id: this.messageId!,
			channelId: this.channelId,
			guildId: this.channel!.guildId,
			incidentId: this.incidentId
		};
	}
}
