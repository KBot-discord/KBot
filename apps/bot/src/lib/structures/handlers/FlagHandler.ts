import { EmbedColors } from '#utils/constants';
import { EmbedBuilder, InteractionCollector, InteractionType } from 'discord.js';
import { isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import { Time } from '@sapphire/duration';
import type { ButtonInteraction, StringSelectMenuInteraction, User, GuildTextBasedChannel, Guild, ChatInputCommandInteraction } from 'discord.js';
import type { FeatureFlags } from '@kbotdev/database';

type InteractionUnion = ButtonInteraction<'cached'> | StringSelectMenuInteraction<'cached'>;

export class FlagHandler {
	private readonly response: ChatInputCommandInteraction;

	private collector: InteractionCollector<InteractionUnion> | null = null;
	private flags: FeatureFlags[] = [];

	public constructor({ response, targetGuild, target }: { response: ChatInputCommandInteraction; targetGuild: Guild; target: User }) {
		this.response = response;
		this.setupCollector(response.channel as GuildTextBasedChannel, target, targetGuild);
	}

	private setupCollector(channel: GuildTextBasedChannel, target: User, targetGuild: Guild): void {
		this.collector = new InteractionCollector<InteractionUnion>(target.client, {
			filter: (interaction) => interaction.member.id === target.id,
			time: Time.Minute * 14,
			guild: isGuildBasedChannel(channel) ? channel.guild : undefined,
			channel,
			interactionType: InteractionType.MessageComponent
		})
			.on('collect', this.handleCollect.bind(this, targetGuild))
			.on('end', this.handleEnd.bind(this));
	}

	private async handleCollect(targetGuild: Guild, interaction: ButtonInteraction | StringSelectMenuInteraction): Promise<void> {
		await interaction.deferUpdate();

		if (interaction.customId === 'featureflags-menu') {
			this.flags = (interaction as StringSelectMenuInteraction).values as FeatureFlags[];
		} else if (interaction.customId === 'featureflags-save' || interaction.customId === 'featureflags-cancel') {
			this.collector?.stop();

			if (interaction.customId === 'featureflags-save') {
				const settings = await container.core.settings.upsert(targetGuild.id, {
					flags: this.flags
				});

				await this.response.editReply({
					embeds: [
						new EmbedBuilder() //
							.setColor(EmbedColors.Success)
							.setTitle(`Feature flags for: ${targetGuild.id}`)
							.setDescription(
								this.flags.length === 0 //
									? 'No flags set.'
									: settings.flags.map((flag) => `\`${flag}\``).join(' ')
							)
					],
					components: []
				});
			}
		}
	}

	private async handleEnd(): Promise<void> {
		this.collector?.removeAllListeners();
	}
}
