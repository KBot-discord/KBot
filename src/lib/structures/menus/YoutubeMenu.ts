import { EmbedColors } from '#utils/constants';
import { getGuildIcon } from '#utils/Discord';
import { Menu, MenuPageBuilder, MenuPagesBuilder } from '@kbotdev/menus';
import { container } from '@sapphire/framework';
import type { EmbedBuilder, Guild, Message, User } from 'discord.js';
import type { AnyInteractableInteraction } from '@sapphire/discord.js-utilities';
import type { YoutubeSubscriptionWithChannel } from '#types/database';

export class YoutubeMenu extends Menu {
	private guild;
	private subscriptions: YoutubeSubscriptionWithChannel[];

	public constructor(guild: Guild, subscriptions: YoutubeSubscriptionWithChannel[]) {
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
						.setAuthor({ name: 'Youtube management', iconURL: getGuildIcon(this.guild) })
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
		return this.subscriptions.map((subscription) => {
			return container.youtube.buildSubscriptionEmbed(this.guild, subscription);
		});
	}
}
