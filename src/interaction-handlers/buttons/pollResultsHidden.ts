import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullOrUndefined } from '@sapphire/utilities';
import { type ButtonInteraction, EmbedBuilder } from 'discord.js';
import type { GuildTextBasedChannel } from 'discord.js';
import type { PollMenuButton } from '../../lib/types/CustomIds.js';
import { EmbedColors } from '../../lib/utilities/constants.js';
import { PollCustomIds } from '../../lib/utilities/customIds.js';
import { validCustomId } from '../../lib/utilities/decorators.js';
import { fetchChannel, parseCustomId } from '../../lib/utilities/discord.js';

@ApplyOptions<InteractionHandler.Options>({
	name: PollCustomIds.ResultsHidden,
	interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ButtonHandler extends InteractionHandler {
	public override async run(
		interaction: ButtonInteraction<'cached'>,
		{ pollId }: InteractionHandler.ParseResult<this>,
	): Promise<void> {
		const {
			utility: { polls },
		} = this.container;

		const active = await polls.isActive(interaction.guildId, pollId);
		if (!active) {
			return void interaction.defaultReply('That poll is not active. Run `/poll menu` to see the updated menu.');
		}

		const poll = await polls.get(pollId);
		if (isNullOrUndefined(poll)) {
			return void interaction.errorReply('There was an error when trying to show the poll results.');
		}

		const channel = await fetchChannel<GuildTextBasedChannel>(poll.channelId);
		if (!channel) {
			return void interaction.errorReply("The channel that the poll was sent in doesn't exist anymore.");
		}

		const message = await channel.messages.fetch(pollId).catch(() => null);
		if (!message) {
			return void interaction.errorReply("The poll doesn't exist anymore.");
		}

		const votes = await polls.getVotes(interaction.guildId, pollId);
		const results = polls.calculateResults(poll, votes);

		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setTitle(`Results: ${message.embeds[0].title}`)
					.setDescription(results.join('\n'))
					.setFooter({ text: message.embeds[0].footer!.text })
					.setTimestamp(),
			],
		});
	}

	@validCustomId(PollCustomIds.ResultsHidden)
	public override async parse(interaction: ButtonInteraction<'cached'>) {
		const settings = await this.container.utility.settings.get(interaction.guildId);
		if (isNullOrUndefined(settings) || !settings.enabled) {
			await interaction.errorReply(
				'The module for this feature is disabled.\nYou can run `/utility toggle` to enable it.',
				{
					tryEphemeral: true,
				},
			);
			return this.none();
		}

		const {
			data: { pollId },
		} = parseCustomId<PollMenuButton>(interaction.customId);

		await interaction.deferReply({ ephemeral: true });

		return this.some({ pollId });
	}
}
