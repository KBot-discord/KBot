import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandlerTypes } from '@sapphire/framework';
import { MessageEmbed, type ButtonInteraction } from 'discord.js';
import { EmbedColors, PollCustomIds } from '../../../lib/util/constants';
import { isNullish } from '@sapphire/utilities';
import { DeferOptions, MenuInteractionHandler } from '@kbotdev/menus';
import type { PollMenuButton } from '../../../lib/types/CustomIds';

@ApplyOptions<MenuInteractionHandler.Options>({
	customIdPrefix: [PollCustomIds.ResultsPublic, PollCustomIds.ResultsHidden],
	defer: DeferOptions.Reply,
	ephemeral: true,
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends MenuInteractionHandler {
	public override async run(interaction: ButtonInteraction, { identifier, data: { pollId } }: MenuInteractionHandler.Result<PollMenuButton>) {
		const hide = identifier === PollCustomIds.ResultsHidden;

		const { polls } = this.container;
		try {
			const poll = await polls.repo.getPollWithUsers(pollId);
			if (isNullish(poll)) {
				return interaction.defaultReply('Poll already ended.');
			}

			const message = await this.container.client.channels
				.fetch(poll.channel)
				.then((channel) => (channel?.isText() ? channel.messages.fetch(poll.id) : null));
			if (isNullish(message)) {
				return interaction.errorReply('no message');
			}

			const results = await polls.calculateResults(poll);
			if (isNullish(results)) {
				return interaction.errorReply('no results');
			}

			if (hide) {
				return interaction.followUp({
					embeds: [
						new MessageEmbed()
							.setColor(EmbedColors.Default)
							.setTitle(`Results: ${message.embeds[0].title}`)
							.setDescription(results.join('\n'))
							.setFooter({ text: message.embeds[0].footer!.text })
							.setTimestamp()
					]
				});
			}
			await interaction.defaultReply('Results sent.');
			return interaction.channel!.send({
				embeds: [
					new MessageEmbed()
						.setColor(EmbedColors.Default)
						.setTitle(`Results: ${message.embeds[0].title}`)
						.setDescription(results.join('\n'))
						.setFooter({ text: message.embeds[0].footer!.text })
						.setTimestamp()
				]
			});
		} catch (err) {
			this.container.logger.error(err);
			return interaction.errorReply('Something went wrong.');
		}
	}
}
