import { getUserInfo, isWebhookMessage } from '#utils/Discord';
import { EmbedColors } from '#utils/constants';
import { ActionRowBuilder, EmbedBuilder, InteractionCollector, ButtonBuilder, ComponentType } from 'discord.js';
import { ButtonStyle, InteractionType, PermissionFlagsBits } from 'discord-api-types/v10';
import type { APIActionRowComponent, APIButtonComponent } from 'discord-api-types/v10';
import type { ButtonInteraction, GuildMember, Message, GuildTextBasedChannel } from 'discord.js';

export enum ReportButtons {
	Delete,
	Info
}

const ButtonCustomId = {
	Delete: '@kbotdev/report.delete',
	Info: '@kbotdev/report.info',
	Confirm: '@kbotdev/report.confirm',
	Cancel: '@kbotdev/report.cancel'
} as const;

export class ReportHandler {
	private readonly targetMember: GuildMember;
	private readonly targetMessage: Message<true>;

	private readonly reportMessage: Message<true>;
	private readonly reportChannel: GuildTextBasedChannel;

	private collector: InteractionCollector<ButtonInteraction<'cached'>> | null = null;

	public constructor(reportChannel: GuildTextBasedChannel, targetMessage: Message<true>, reportMessage: Message<true>) {
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
		} else if (interaction.customId === ButtonCustomId.Info) {
			await this.toggleButton(true, ReportButtons.Info);
			const embed = await getUserInfo(interaction, this.targetMember.id);
			await this.reportMessage.reply({
				embeds: [embed]
			});
		}
	}

	private async handleEnd() {
		await this.toggleButton(true, ReportButtons.Delete, ReportButtons.Info);

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
