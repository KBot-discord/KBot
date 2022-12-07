import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { MessageEmbed, type ButtonInteraction } from 'discord.js';
import { EmbedColors } from '../../../lib/util/constants';
import { parseKey } from '../../../lib/util/keys';
import { PollCustomIds } from '../../../lib/types/enums';
import { isNullish } from '@sapphire/utilities';
import type { Key, IPollMenuCustomId } from '../../../lib/types/keys';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction, { pollId, hide }: InteractionHandler.ParseResult<this>) {
		const { polls } = this.container;
		try {
			const poll = await polls.db.getPollWithUsers(pollId);
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

	public override async parse(interaction: ButtonInteraction) {
		if (interaction.customId.startsWith(PollCustomIds.ResultsPublic) || interaction.customId.startsWith(PollCustomIds.ResultsHidden)) {
			await interaction.deferReply({ ephemeral: true });

			const { pollId } = parseKey<IPollMenuCustomId>(interaction.customId as Key);

			return this.some({ pollId, hide: interaction.customId.startsWith(PollCustomIds.ResultsHidden) });
		}
		return this.none();
	}
}
