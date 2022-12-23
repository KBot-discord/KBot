import { Menu, PageBuilder, PagesBuilder } from '@kbotdev/menus';
import { Guild, Message, MessageEmbed, User } from 'discord.js';
import { EmbedColors } from '../util/constants';
import { channelMention, roleMention } from '@discordjs/builders';
import type { NonModalInteraction } from '@sapphire/discord.js-utilities';
import type { Subscription } from '../../rpc/gen/subscriptions/v1/subscriptions.pb';

export class YoutubeMenu extends Menu {
	private guild;
	private subscriptions: Subscription[] = [];

	public constructor(guild: Guild, subscriptions: Subscription[]) {
		super();
		this.guild = guild;
		this.subscriptions = subscriptions;
	}

	public override async run(messageOrInteraction: Message | NonModalInteraction, target?: User) {
		await this.build();
		return super.run(messageOrInteraction, target);
	}

	public async build() {
		const embeds = await this.buildEmbeds();
		const pages = this.buildPages(embeds);
		this.setPages(pages);
		this.setHomePage((builder) =>
			builder.setEmbeds((embed) => {
				return [
					embed
						.setColor(EmbedColors.Default)
						.setAuthor({ name: 'Poll management', iconURL: this.guild.iconURL()! })
						.addFields([
							{ name: 'Instructions:', value: 'text' },
							{ name: 'More text:', value: 'even more text' }
						])
				];
			})
		);
	}

	private buildPages(embeds: MessageEmbed[]): PagesBuilder {
		return new PagesBuilder().setPages(
			embeds.map((embed) => {
				return new PageBuilder() //
					.setEmbeds([embed]);
			})
		);
	}

	private async buildEmbeds(): Promise<MessageEmbed[]> {
		const { guild } = this;

		return Promise.all(
			this.subscriptions.map((subscription) => {
				return new MessageEmbed() //
					.setColor(EmbedColors.Default)
					.setAuthor({ name: 'YouTube notifications config', iconURL: guild.iconURL()! })
					.setTitle(subscription.channelName)
					.setFields([
						{ name: 'Message', value: subscription.message },
						{ name: 'Channel', value: channelMention(subscription.discordChannel) },
						{ name: 'Role', value: roleMention(subscription.role) }
					])
					.setThumbnail(subscription.channelImage);
			})
		);
	}
}
