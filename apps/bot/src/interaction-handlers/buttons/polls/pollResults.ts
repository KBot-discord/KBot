import { EmbedColors } from '#utils/constants';
import { parseCustomId, PollCustomIds } from '#utils/customIds';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { isNullish } from '@sapphire/utilities';
import type { ButtonInteraction, GuildTextBasedChannel } from 'discord.js';
import type { PollMenuButton } from '#types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	private readonly customIds = [PollCustomIds.ResultsPublic, PollCustomIds.ResultsHidden];

	public override async run(interaction: ButtonInteraction<'cached'>, { hidden, pollId }: InteractionHandler.ParseResult<this>) {
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
				return interaction.errorReply('There was an error when trying to show the poll results.');
			}

			const channel = (await client.channels.fetch(poll.channelId)) as GuildTextBasedChannel | null;
			if (!channel) {
				return interaction.errorReply("The channel that the poll was sent in doesn't exist anymore.");
			}

			const message = await channel.messages.fetch(pollId);
			if (!message) {
				return interaction.errorReply("The poll doesn't exist anymore.");
			}

			const votes = await polls.getVotes({
				guildId: interaction.guildId,
				pollId
			});
			const results = polls.calculateResults(poll, votes);

			if (hidden) {
				return interaction.editReply({
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
			return interaction.errorReply('There was an error when trying to show the poll results.');
		}
	}

	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (!this.customIds.some((id) => interaction.customId.startsWith(id))) return this.none();

		const settings = await this.container.utility.getSettings(interaction.guildId);
		if (isNullish(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`);
			return this.none();
		}

		const {
			prefix,
			data: { pollId }
		} = parseCustomId<PollMenuButton>(interaction.customId);
		const hidden = prefix === PollCustomIds.ResultsHidden;

		if (hidden) {
			await interaction.deferReply({ ephemeral: true });
		} else {
			await interaction.deferUpdate();
		}

		return this.some({ hidden, pollId });
	}
}
