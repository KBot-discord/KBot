import { EmbedColors } from '#utils/constants';
import { EmbedBuilder, InteractionCollector, InteractionType } from 'discord.js';
import { isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import { Time } from '@sapphire/duration';
import type { ButtonInteraction, StringSelectMenuInteraction, User, GuildTextBasedChannel, Message, Guild } from 'discord.js';
import type { FeatureFlags } from '#prisma';

export class FlagHandler {
	private readonly response: Message<true>;

	private collector: InteractionCollector<ButtonInteraction<'cached'> | StringSelectMenuInteraction<'cached'>> | null = null;
	private flags: FeatureFlags[] = [];

	public constructor({ response, targetGuild, target }: { response: Message<true>; targetGuild: Guild; target: User }) {
		this.response = response;
		this.setupCollector(response.channel, target, targetGuild);
	}

	private setupCollector(channel: GuildTextBasedChannel, target: User, targetGuild: Guild) {
		this.collector = new InteractionCollector<ButtonInteraction<'cached'> | StringSelectMenuInteraction<'cached'>>(target.client, {
			filter: (interaction) => interaction.member.id === target.id,
			time: Time.Minute * 14,
			guild: isGuildBasedChannel(channel) ? channel.guild : undefined,
			channel,
			interactionType: InteractionType.MessageComponent
		})
			.on('collect', this.handleCollect.bind(this, targetGuild))
			.on('end', this.handleEnd.bind(this));
	}

	private async handleCollect(targetGuild: Guild, interaction: ButtonInteraction<'cached'> | StringSelectMenuInteraction<'cached'>) {
		await interaction.deferUpdate();

		if (interaction.customId === 'featureflags-menu') {
			this.flags = (interaction as StringSelectMenuInteraction).values as FeatureFlags[];
		} else if (interaction.customId === 'featureflags-save' || interaction.customId === 'featureflags-cancel') {
			this.collector?.stop();

			if (interaction.customId === 'featureflags-save') {
				const settings = await container.core.upsertSettings(targetGuild.id, {
					flags: this.flags
				});

				await interaction.channel!.send({
					embeds: [
						new EmbedBuilder() //
							.setColor(EmbedColors.Success)
							.setTitle(`Feature flags for: ${targetGuild.id}`)
							.setDescription(
								this.flags.length === 0 //
									? 'No flags set.'
									: settings.flags.map((flag) => `\`${flag}\``).join(' ')
							)
					]
				});
			}
		}
	}

	private async handleEnd() {
		this.collector?.removeAllListeners();
		await this.response.delete().catch(() => null);
	}
}