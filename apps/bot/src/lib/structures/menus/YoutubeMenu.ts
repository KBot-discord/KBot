import { EmbedColors } from '#utils/constants';
import { Menu, MenuPageBuilder, MenuPagesBuilder } from '@kbotdev/menus';
import { container } from '@sapphire/framework';
import type { EmbedBuilder, Message, User } from 'discord.js';
import type { AnyInteractableInteraction } from '@sapphire/discord.js-utilities';
import type { YoutubeSubscriptionWithChannel } from '@kbotdev/database';

export class YoutubeMenu extends Menu {
	private readonly subscriptions: YoutubeSubscriptionWithChannel[];

	public constructor(subscriptions: YoutubeSubscriptionWithChannel[]) {
		super();
		this.subscriptions = subscriptions;
	}

	public override async run(messageOrInteraction: AnyInteractableInteraction | Message, target?: User): Promise<this> {
		const embeds = this.buildEmbeds();
		const pages = this.buildPages(embeds);

		this.setSelectMenuPlaceholder('Select a subscription');

		this.setSelectMenuOptions((pageIndex) => {
			const { channel } = this.subscriptions[pageIndex - 1];
			return { label: channel.englishName ?? channel.name };
		});

		if (embeds.length > 0) {
			this.setPages(pages);
		} else {
			this.setHomePage((builder) =>
				builder.setEmbeds((embed) => {
					return [
						embed //
							.setColor(EmbedColors.Default)
							.setDescription('There are no subscriptions to show.')
					];
				})
			);
		}

		return super.run(messageOrInteraction, target);
	}

	private buildPages(embeds: EmbedBuilder[]): MenuPagesBuilder {
		return new MenuPagesBuilder().setPages(
			embeds.map((embed) => {
				return new MenuPageBuilder() //
					.setEmbeds([embed]);
			})
		);
	}

	private buildEmbeds(): EmbedBuilder[] {
		return this.subscriptions.map((subscription) => {
			return container.youtube.buildSubscriptionEmbed(subscription);
		});
	}
}
