import { EmbedColors } from '#utils/constants';
import { parseCustomId, PollCustomIds } from '#utils/customIds';
import { validCustomId } from '#utils/decorators';
import { KBotErrors } from '#types/Enums';
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
	public override async run(interaction: ButtonInteraction<'cached'>, { pollId }: InteractionHandler.ParseResult<this>) {
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
				return interaction.defaultFollowup('That poll is not active. Run `/poll menu` to see the updated menu.', true);
			}

			const poll = await polls.get({ pollId });
			if (isNullish(poll)) {
				return interaction.errorFollowup('There was an error when trying to show the poll results.', true);
			}

			const channel = (await client.channels.fetch(poll.channelId)) as GuildTextBasedChannel | null;
			if (!channel) {
				return interaction.errorFollowup("The channel that the poll was sent in doesn't exist anymore.", true);
			}

			const message = await channel.messages.fetch(pollId);
			if (!message) {
				return interaction.errorFollowup("The poll doesn't exist anymore.", true);
			}

			const votes = await polls.getVotes({
				guildId: interaction.guildId,
				pollId
			});
			const results = polls.calculateResults(poll, votes);

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
			return interaction.errorFollowup('There was an error when trying to show the poll results.', true);
		}
	}

	@validCustomId(PollCustomIds.ResultsPublic)
	public override async parse(interaction: ButtonInteraction<'cached'>) {
		const settings = await this.container.utility.getSettings(interaction.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`, true);
			return this.none();
		}

		const { result, error } = await this.container.validator.channels.canSendEmbeds(interaction.channel);
		if (!result) {
			interaction.client.emit(KBotErrors.ChannelPermissions, { interaction, error });
			return this.none();
		}

		const {
			data: { pollId }
		} = parseCustomId<PollMenuButton>(interaction.customId);

		await interaction.deferUpdate();

		return this.some({ pollId });
	}
}
