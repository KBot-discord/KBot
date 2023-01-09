import { EmbedColors, PollCustomIds } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { type ButtonInteraction, ChannelType, EmbedBuilder } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import { parseCustomId } from '@kbotdev/custom-id';
import type { PollMenuButton } from '#lib/types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [PollCustomIds.ResultsPublic, PollCustomIds.ResultsHidden];

	public override async run(interaction: ButtonInteraction, { hidden, pollId }: InteractionHandler.ParseResult<this>) {
		const { polls } = this.container;
		try {
			const poll = await polls.repo.getPollWithUsers(pollId);
			if (isNullish(poll)) {
				return interaction.defaultReply('Poll already ended.');
			}

			const message = await this.container.client.channels
				.fetch(poll.channel)
				.then((channel) => (channel!.type === ChannelType.GuildText ? channel.messages.fetch(poll.id) : null));
			if (isNullish(message)) {
				return interaction.errorReply('no message');
			}

			const results = polls.calculateResults(poll);
			if (isNullish(results)) {
				return interaction.errorReply('no results');
			}

			if (hidden) {
				return interaction.followUp({
					embeds: [
						new EmbedBuilder()
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
					new EmbedBuilder()
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
		if (!this.customIds.some((id) => interaction.customId.startsWith(id))) return this.none();

		const {
			prefix,
			data: { pollId }
		} = parseCustomId<PollMenuButton>(interaction.customId);
		const hidden = prefix === PollCustomIds.ResultsHidden;

		return this.some({ hidden, pollId });
	}
}
