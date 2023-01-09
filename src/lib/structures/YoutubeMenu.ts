import { EmbedColors } from '#utils/constants';
import { Menu, MenuPageBuilder, MenuPagesBuilder } from '@kbotdev/menus';
import { Guild, Message, EmbedBuilder, User } from 'discord.js';
import { channelMention, roleMention } from '@discordjs/builders';
import type { AnyInteractableInteraction } from '@sapphire/discord.js-utilities';
import type { Subscription } from '../../rpc/gen/subscriptions/v1/subscriptions.pb';

export class YoutubeMenu extends Menu {
	private guild;
	private subscriptions: Subscription[] = [];

	public constructor(guild: Guild, subscriptions: Subscription[]) {
		super();
		this.guild = guild;
		this.subscriptions = subscriptions;
	}

	public override async run(messageOrInteraction: Message | AnyInteractableInteraction, target?: User) {
		await this.build();
		return super.run(messageOrInteraction, target);
	}

	public async build() {
		const embeds = await this.buildEmbeds();
		const pages = this.buildPages(embeds);

		await this.setPages(pages);

		await this.setHomePage((builder) =>
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

	private buildPages(embeds: EmbedBuilder[]): MenuPagesBuilder {
		return new MenuPagesBuilder().setPages(
			embeds.map((embed) => {
				return new MenuPageBuilder() //
					.setEmbeds([embed]);
			})
		);
	}

	private async buildEmbeds(): Promise<EmbedBuilder[]> {
		const { guild } = this;

		return Promise.all(
			this.subscriptions.map((subscription) => {
				return new EmbedBuilder() //
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
