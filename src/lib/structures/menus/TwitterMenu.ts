import { EmbedColors } from '#utils/constants';
import { getGuildIcon } from '#utils/Discord';
import { Menu, MenuPageBuilder, MenuPagesBuilder } from '@kbotdev/menus';
import { container } from '@sapphire/framework';
import type { EmbedBuilder, Guild, Message, User } from 'discord.js';
import type { Subscription } from '#rpc/twitter';
import type { AnyInteractableInteraction } from '@sapphire/discord.js-utilities';

export class TwitterMenu extends Menu {
	private guild;
	private subscriptions: Subscription[];

	public constructor(guild: Guild, subscriptions: Subscription[]) {
		super();
		this.guild = guild;
		this.subscriptions = subscriptions;
	}

	public override run(messageOrInteraction: Message | AnyInteractableInteraction, target?: User) {
		const embeds = this.buildEmbeds();
		const pages = this.buildPages(embeds);

		this.setPages(pages);
		this.setHomePage((builder) =>
			builder.setEmbeds((embed) => {
				return [
					embed
						.setColor(EmbedColors.Default)
						.setAuthor({ name: 'Twitter management', iconURL: getGuildIcon(this.guild) })
						.addFields([
							{ name: 'Instructions:', value: 'text' },
							{ name: 'More text:', value: 'even more text' }
						])
				];
			})
		);

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
		const { twitter } = container.notifications;

		return this.subscriptions.map((subscription) => {
			return twitter.buildSubscriptionEmbed(this.guild, subscription);
		});
	}
}
