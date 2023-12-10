import { EmbedColors } from '#lib/utilities/constants';
import { PollCustomIds } from '#lib/utilities/customIds';
import { validCustomId } from '#lib/utilities/decorators';
import { isNullOrUndefined } from '#lib/utilities/functions';
import { fetchChannel, parseCustomId } from '#lib/utilities/discord';
import { KBotErrors } from '#lib/types/Enums';
import { ChannelPermissionsError } from '#lib/structures/errors/ChannelPermissionsError';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import type { GuildTextBasedChannel } from 'discord.js';
import type { PollMenuButton } from '#lib/types/CustomIds';

@ApplyOptions<InteractionHandler.Options>({
	name: PollCustomIds.ResultsPublic,
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>, { pollId }: InteractionHandler.ParseResult<this>): Promise<void> {
		const {
			utility: { polls }
		} = this.container;

		const active = await polls.isActive(interaction.guildId, pollId);
		if (!active) {
			return void interaction.defaultFollowup('That poll is not active. Run `/poll menu` to see the updated menu.', {
				ephemeral: true
			});
		}

		const poll = await polls.get(pollId);
		if (isNullOrUndefined(poll)) {
			return void interaction.errorFollowup('There was an error when trying to show the poll results.', {
				ephemeral: true
			});
		}

		const channel = await fetchChannel<GuildTextBasedChannel>(poll.channelId);
		if (!channel) {
			return void interaction.errorFollowup("The channel that the poll was sent in doesn't exist anymore.", {
				ephemeral: true
			});
		}

		const message = await channel.messages.fetch(pollId).catch(() => null);
		if (!message) {
			return void interaction.errorFollowup("The poll doesn't exist anymore.", {
				ephemeral: true
			});
		}

		const votes = await polls.getVotes(interaction.guildId, pollId);
		const results = polls.calculateResults(poll, votes);

		await interaction.channel!.send({
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

	@validCustomId(PollCustomIds.ResultsPublic)
	public override async parse(interaction: ButtonInteraction<'cached'>) {
		const settings = await this.container.utility.settings.get(interaction.guildId);
		if (isNullOrUndefined(settings) || !settings.enabled) {
			await interaction.errorReply(`The module for this feature is disabled.\nYou can run \`/utility toggle\` to enable it.`, {
				tryEphemeral: true
			});
			return this.none();
		}

		const { result } = await this.container.validator.channels.canSendEmbeds(interaction.channel);
		if (!result) {
			interaction.client.emit(KBotErrors.ChannelPermissions, {
				interaction,
				error: new ChannelPermissionsError()
			});
			return this.none();
		}

		const {
			data: { pollId }
		} = parseCustomId<PollMenuButton>(interaction.customId);

		await interaction.deferUpdate();

		return this.some({ pollId });
	}
}
