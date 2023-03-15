import { getUserInfo, isWebhookMessage } from '#utils/Discord';
import { EmbedColors } from '#utils/constants';
import { ModerationAction } from '#structures/ModerationAction';
import { ActionRowBuilder, EmbedBuilder, InteractionCollector, ButtonBuilder, ComponentType } from 'discord.js';
import { ButtonStyle, InteractionType, PermissionFlagsBits } from 'discord-api-types/v10';
import { Time } from '@sapphire/duration';
import type { APIActionRowComponent, APIButtonComponent } from 'discord-api-types/v10';
import type { ButtonInteraction, GuildMember, Message, GuildTextBasedChannel } from 'discord.js';
import type { ModerationSettings } from '#prisma';

export enum ReportButtons {
	Timeout,
	Delete,
	Info
}

const ButtonCustomId = {
	Timeout: '@kbotdev/report.timeout',
	Delete: '@kbotdev/report.delete',
	Info: '@kbotdev/report.info',
	Confirm: '@kbotdev/report.confirm',
	Cancel: '@kbotdev/report.cancel'
} as const;

export class ReportHandler {
	private readonly settings: ModerationSettings;
	private readonly moderator: GuildMember;

	private readonly targetMember: GuildMember;
	private readonly targetMessage: Message<true>;

	private readonly reportMessage: Message<true>;
	private readonly reportChannel: GuildTextBasedChannel;

	private collector: InteractionCollector<ButtonInteraction<'cached'>> | null = null;

	public constructor(
		settings: ModerationSettings,
		reportChannel: GuildTextBasedChannel,
		moderator: GuildMember,
		targetMessage: Message<true>,
		reportMessage: Message<true>
	) {
		this.settings = settings;
		this.moderator = moderator;
		this.targetMessage = targetMessage;
		this.targetMember = targetMessage.member!;
		this.reportMessage = reportMessage;
		this.reportChannel = reportChannel;

		if (!isWebhookMessage(this.targetMessage)) {
			this.setupCollector();
		}
	}

	private async handleCollect(interaction: ButtonInteraction<'cached'>): Promise<void> {
		await interaction.deferUpdate();

		const { channel } = this.targetMessage;
		const client = await interaction.guild.members.fetchMe();

		if (interaction.customId === ButtonCustomId.Timeout) {
			if (!this.targetMember.moderatable) {
				await interaction.errorFollowup(
					`I don't have the required permission, or I am not high enough in the role hierarchy to ban that user.${
						client.permissions.has(PermissionFlagsBits.ModerateMembers) ? '' : '\n\nRequired permission: Timeout Members'
					}`,
					true
				);
				return;
			}
			if (
				!(interaction.guild.ownerId === interaction.member.id) &&
				this.targetMember.roles.highest.position >= interaction.member.roles.highest.position
			) {
				await interaction.errorFollowup("You cannot timeout this user. (target's highest role is above or equal to yours)", true);
				return;
			}
			await this.toggleButton(true, ReportButtons.Timeout);
			const text = `Would you like to timeout <@${this.targetMember.id}> for 15 minutes?`;
			await this.confirmationPrompt(interaction.member, text, ReportButtons.Timeout);
		}

		if (interaction.customId === ButtonCustomId.Delete) {
			if (!channel.permissionsFor(await interaction.guild.members.fetchMe()).has(PermissionFlagsBits.ManageMessages)) {
				await interaction.errorFollowup(
					"I don't have the required permission to delete that message.\n\nRequired permission: Manage Messages",
					true
				);
				return;
			}
			await this.toggleButton(true, ReportButtons.Delete);
			const text = 'Would you like to delete the offending message?';
			await this.confirmationPrompt(interaction.member, text, ReportButtons.Delete);
		}

		if (interaction.customId === ButtonCustomId.Info) {
			await this.toggleButton(true, ReportButtons.Info);
			const embed = await getUserInfo(interaction, this.targetMember.id);
			await this.reportMessage.reply({
				embeds: [embed]
			});
		}
	}

	private async handleEnd() {
		await this.toggleButton(true, ReportButtons.Delete, ReportButtons.Timeout, ReportButtons.Info);

		this.collector?.removeAllListeners();
	}

	private async confirmationPrompt(initiator: GuildMember, text: string, type: ReportButtons) {
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder() //
					.setCustomId(ButtonCustomId.Confirm)
					.setLabel('Confirm')
					.setStyle(ButtonStyle.Success)
			)
			.addComponents(
				new ButtonBuilder() //
					.setCustomId(ButtonCustomId.Cancel)
					.setLabel('Cancel')
					.setStyle(ButtonStyle.Danger)
			);

		const message = await this.reportChannel.send({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColors.Default)
					.setDescription(text)
					.setFooter({ text: `Confirmation for ${initiator.user.tag}` })
			],
			components: [row]
		});
		const filter = (i: ButtonInteraction<'cached'>) => {
			return i.member.id === initiator.id;
		};

		message
			.awaitMessageComponent({
				filter,
				componentType: ComponentType.Button,
				time: 30000
			})
			.then(async (i: ButtonInteraction<'cached'>): Promise<void> => {
				await message.delete();
				if (i.customId === ButtonCustomId.Cancel) {
					await this.toggleButton(false, type);
					return;
				}
				if (type === ReportButtons.Timeout) {
					if (this.targetMember.moderatable) {
						await new ModerationAction(this.settings, this.moderator) //
							.timeout(this.targetMember, {
								reason: 'Sending a rule-breaking message.',
								sendDm: true,
								silent: false,
								expiresIn: Time.Minute * 15
							});
						return;
					}

					await this.reportChannel.send({
						content: "I don't have the required permissions to timeout that user."
					});
					return;
				}
				if (type === ReportButtons.Delete) {
					await this.targetMessage.delete();
				}
			})
			.catch(async () => {
				await message.delete();
				await this.toggleButton(false, type);
			});
	}

	private setupCollector(): void {
		this.collector = new InteractionCollector<ButtonInteraction<'cached'>>(this.targetMember.client, {
			filter: (i) => {
				if (i.customId === ButtonCustomId.Timeout) {
					return i.memberPermissions.has(PermissionFlagsBits.ModerateMembers) && i.member.id !== this.targetMember.id;
				}
				if (i.customId === ButtonCustomId.Delete) {
					return i.memberPermissions.has(PermissionFlagsBits.ManageMessages) && i.member.id !== this.targetMember.id;
				}
				return i.memberPermissions.has(PermissionFlagsBits.ManageMessages);
			},

			time: 1000 * 60 * 14.5,

			message: this.reportMessage,

			guild: this.targetMessage.guild,

			channel: this.targetMessage.channel,

			interactionType: InteractionType.MessageComponent
		})
			.on('collect', this.handleCollect.bind(this))
			.on('end', this.handleEnd.bind(this));
	}

	private async toggleButton(disabled: boolean, ...buttons: ReportButtons[]): Promise<void> {
		const row = this.reportMessage.components[0] as APIActionRowComponent<APIButtonComponent>;
		const updatedRow: ActionRowBuilder<ButtonBuilder> = ActionRowBuilder.from(row);

		buttons.forEach((entry) => {
			updatedRow.components[entry].setDisabled(disabled);
		});

		await this.reportMessage.edit({
			embeds: this.reportMessage.embeds,
			components: [updatedRow]
		});
	}
}
