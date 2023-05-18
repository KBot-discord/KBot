import { EmbedColors } from '#utils/constants';
import { parseCustomId, PollCustomIds } from '#utils/customIds';
import { validCustomId } from '#utils/decorators';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { EmbedBuilder, ButtonInteraction } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { GuildTextBasedChannel } from 'discord.js';
import type { PollMenuButton } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>, { pollId }: InteractionHandler.ParseResult<this>): Promise<void> {
		const {
			client,
			utility: { polls }
		} = this.container;

		try {
			const active = await polls.isActive({
				guildId: interaction.guildId,
				pollId
			});
			if (!active) {
				await interaction.defaultReply('That poll is not active. Run `/poll menu` to see the updated menu.');
				return;
			}

			const poll = await polls.get({ pollId });
			if (isNullish(poll)) {
				await interaction.errorReply('There was an error when trying to show the poll results.');
				return;
			}

			const channel = (await client.channels.fetch(poll.channelId)) as GuildTextBasedChannel | null;
			if (!channel) {
				await interaction.errorReply("The channel that the poll was sent in doesn't exist anymore.");
				return;
			}

			const message = await channel.messages.fetch(pollId).catch(() => null);
			if (!message) {
				await interaction.errorReply("The poll doesn't exist anymore.");
				return;
			}

			const votes = await polls.getVotes({
				guildId: interaction.guildId,
				pollId
			});
			const results = polls.calculateResults(poll, votes);

			await interaction.editReply({
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
			await interaction.errorReply('There was an error when trying to show the poll results.');
		}
	}

	@validCustomId(PollCustomIds.ResultsHidden)
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
	public override async parse(interaction: ButtonInteraction<'cached'>) {
		const settings = await this.container.utility.settings.get(interaction.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`, true);
			return this.none();
		}

		const {
			data: { pollId }
		} = parseCustomId<PollMenuButton>(interaction.customId);

		await interaction.deferReply({ ephemeral: true });

		return this.some({ pollId });
	}
}
