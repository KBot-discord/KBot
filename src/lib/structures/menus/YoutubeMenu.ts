import type { AnyInteractableInteraction } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import type { EmbedBuilder, Message, User } from 'discord.js';
import type { YoutubeSubscriptionWithChannel } from '../../services/types/youtube.js';
import { MenuPageBuilder } from '../builders/MenuPageBuilder.js';
import { Menu } from './Menu.js';

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

		this.setMenuPages(pages);

		return await super.run(messageOrInteraction, target);
	}

	private buildPages(embeds: EmbedBuilder[]): MenuPageBuilder[] {
		return embeds.map((embed) => {
			return new MenuPageBuilder() //
				.setEmbeds([embed]);
		});
	}

	private buildEmbeds(): EmbedBuilder[] {
		return this.subscriptions.map((subscription) => {
			return container.youtube.buildSubscriptionEmbed(subscription);
		});
	}
}
