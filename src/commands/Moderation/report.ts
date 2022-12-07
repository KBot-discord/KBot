import { ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { getGuildIds } from '../../lib/util/config';
import { isNullish } from '@sapphire/utilities';
import {
	Message,
	MessageActionRow,
	MessageButton,
	User,
	Permissions,
	MessageEmbed,
	MessageAttachment,
	EmbedFieldData,
	TextChannel
} from 'discord.js';
import { BlankSpace } from '../../lib/util/constants';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import type { ModerationModule } from '../../modules/ModerationModule';
import type { ChatInputCommand, ContextMenuCommand } from '@sapphire/framework';

@ApplyOptions<ChatInputCommand.Options>({
	detailedDescription: 'Send the selected message to the set moderator channel.',
	preconditions: ['GuildOnly']
})
export class KBotCommand extends ModuleCommand<ModerationModule> {
	public constructor(context: ModuleCommand.Context, options: ModuleCommand.Options) {
		super(context, { ...options });
		if (Boolean(this.description) && !this.detailedDescription) this.detailedDescription = this.description;
	}

	public override registerApplicationCommands(registry: ContextMenuCommand.Registry) {
		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setName('report')
					.setType(ApplicationCommandType.Message),
			{ idHints: ['1041955416713723924'], guildIds: getGuildIds() }
		);
	}

	public async contextMenuRun(interaction: ContextMenuCommand.Interaction) {
		await interaction.deferReply({ ephemeral: true });

		const module = await this.container.db.moderationModule.findUnique({ where: { id: interaction.guildId! } });
		if (isNullish(module) || isNullish(module.reportChannel))
			return interaction.defaultReply('No report channel set. Please run ``/settings report_channel``');

		let member;
		let memberName;
		let avatar;
		const message = interaction.options.getMessage('message', true) as Message;
		const channel = (await interaction.guild!.channels.fetch(module.reportChannel)) as TextChannel;

		if (message.webhookId && message.type === 'DEFAULT') {
			member = await message.fetchWebhook();
			memberName = `${member.name} (webhook)`;
			avatar = member.avatarURL();
		} else {
			member = await interaction.guild!.members.fetch(message.author.id);
			memberName = (message.author as User).tag;
			avatar = member.displayAvatarURL();
		}

		const row = this.buildButtons();

		if (message.webhookId) {
			row.components[0].setDisabled(true);
			row.components[2].setDisabled(true);
		} else if (
			message.member?.permissions?.has(Permissions.FLAGS.ADMINISTRATOR) ||
			message.member?.permissions?.has(Permissions.FLAGS.BAN_MEMBERS) ||
			message.member?.id === interaction.guild!.ownerId ||
			message.type !== 'DEFAULT'
		) {
			row.components[0].setDisabled(true);
		}

		const mainEmbed = new MessageEmbed()
			.setColor('#006BFC')
			.setAuthor({ name: memberName, iconURL: avatar || 'https://i.imgur.com/ikwmld2.jpg' })
			.setDescription(message.content)
			.setFooter({ text: `Reported by ${interaction.user.tag}` })
			.setTimestamp();

		if (message.reference?.messageId) {
			mainEmbed.addFields(
				{ name: 'Channel', value: `<#${interaction.channelId}>`, inline: true },
				{ name: 'Author', value: `<@${member.id}>`, inline: true },
				{ name: 'Message link', value: `[[link]](${message.url})`, inline: true },
				{
					name: 'Reply to',
					value: `[[Link]](https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${message.reference.messageId})`,
					inline: true
				}
			);
		} else {
			mainEmbed.addFields(
				{ name: 'Channel', value: `<#${interaction.channelId}>`, inline: true },
				{ name: 'Author', value: `<@${member.id}>`, inline: true },
				{ name: 'Message link', value: `[[link]](${message.url})`, inline: true }
			);
		}

		let msg;
		if (message.embeds.length !== 0) {
			msg = await channel.send({
				embeds: [mainEmbed, message.embeds[0]],
				components: [row]
			});
		} else if (message.attachments.size > 0) {
			const fileEmbed = new MessageEmbed().setColor('#006BFC');
			const file = message.attachments.map((e) => {
				return new MessageAttachment(e.url, e.name!).setDescription(e.description!).setSpoiler();
			});
			const fileFields: EmbedFieldData[] = [];
			file.forEach((f) => {
				const name = { name: 'File name', value: f.name!.substring(8, f.name!.length), inline: true };
				fileFields.push(name);
				const desc = { name: 'File description', value: f.description || 'No file description', inline: true };
				fileFields.push(desc);
				const blank = { name: BlankSpace, value: BlankSpace };
				fileFields.push(blank);
			});
			fileFields.pop();
			msg = await channel.send({
				embeds: [mainEmbed, fileEmbed.addFields(fileFields)],
				components: [row]
			});
			await channel.send({
				files: file
			});
		} else {
			msg = await channel.send({
				embeds: [mainEmbed],
				components: [row]
			});
		}
	}

	private buildButtons() {
		return new MessageActionRow().addComponents([
			new MessageButton().setCustomId('timeout').setLabel('Timeout').setStyle('DANGER'),
			new MessageButton().setCustomId('delete').setLabel('Delete').setStyle('PRIMARY'),
			new MessageButton().setCustomId('info').setLabel('User Info').setStyle('PRIMARY')
		]);
	}
}
