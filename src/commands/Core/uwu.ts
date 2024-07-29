import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { ApplicationCommandType, type MessageContextMenuCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { KBotCommand } from '../../lib/extensions/KBotCommand.js';
import { KBotModules } from '../../lib/types/Enums.js';
import { KAOMOJI_CONFUSE, KAOMOJI_EMBARRASSED, KAOMOJI_JOY, KAOMOJI_SPARKLES } from '../../lib/utilities/constants.js';
import type { CoreModule } from '../../modules/CoreModule.js';

function getRandomInt(max: number): number {
	return Math.floor(Math.random() * max);
}

@ApplyOptions<KBotCommand.Options>({
	module: KBotModules.Core,
	description: 'uwu-ify a message.',
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('uwu')
			.setTarget('message');
	},
})
export class CoreCommand extends KBotCommand<CoreModule> {
	private readonly isPrintable = /^[ -~]+$/;
	private readonly character = /[a-zA-Z]/;

	public override registerApplicationCommands(registry: KBotCommand.Registry): void {
		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setName('uwu')
					.setType(ApplicationCommandType.Message)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setDMPermission(false),
			{
				idHints: [],
				guildIds: [],
			},
		);
	}

	public override async contextMenuRun(interaction: MessageContextMenuCommandInteraction): Promise<unknown> {
		const message = interaction.options.getMessage('message', true);

		if (isNullOrUndefinedOrEmpty(message.content)) {
			return await interaction.defaultReply('There is no text to uwu-ify', {
				tryEphemeral: true,
			});
		}

		await interaction.deferReply();

		const uwuText = this.convertString(message.content);
		if (uwuText.length > 1999) {
			return await interaction.editReply({
				content: 'Text is too long (more than 2000 characters)',
			});
		}

		return await interaction.editReply({ content: uwuText });
	}

	private convertString(string: string): string {
		let converted = '';
		let currentWord = '';

		for (const word of string) {
			if (this.isPrintable.test(word) && word !== ' ') {
				currentWord += word;
			} else if (currentWord) {
				converted += this.convertWord(currentWord) + word;
				currentWord = '';
			} else {
				converted += word;
			}
		}

		if (currentWord) {
			converted += this.convertWord(currentWord);
		}

		return converted;
	}

	private convertWord(word: string): string {
		word = word.toLowerCase();
		let uwu = word.replace(/[.?!,]+$/g, '');
		const punctuations = word.slice(uwu.length);

		let finalPunctuation = '';
		let extraPunctuation = '';

		if (punctuations) {
			if (punctuations.length <= 1) {
				[finalPunctuation] = punctuations;
			} else {
				finalPunctuation = punctuations[punctuations.length - 1];
				extraPunctuation = punctuations.slice(0, -1);
			}
		}

		if (finalPunctuation === '.' && !getRandomInt(4)) {
			finalPunctuation = KAOMOJI_JOY[getRandomInt(KAOMOJI_JOY.length)];
		} else if (finalPunctuation === '?' && !getRandomInt(3)) {
			finalPunctuation = KAOMOJI_CONFUSE[getRandomInt(KAOMOJI_CONFUSE.length)];
		} else if (finalPunctuation === '!' && !getRandomInt(3)) {
			finalPunctuation = KAOMOJI_JOY[getRandomInt(KAOMOJI_JOY.length)];
		} else if (finalPunctuation === ',' && !getRandomInt(4)) {
			finalPunctuation = KAOMOJI_EMBARRASSED[getRandomInt(KAOMOJI_EMBARRASSED.length)];
		} else if (finalPunctuation && !getRandomInt(5)) {
			finalPunctuation = KAOMOJI_SPARKLES[getRandomInt(KAOMOJI_SPARKLES.length)];
		}

		if (uwu === "you're" || uwu === 'youre') {
			uwu = 'ur';
		} else if (uwu === 'fuck') {
			uwu = 'fwickk';
		} else if (uwu === 'shit') {
			uwu = 'poopoo';
		} else if (uwu === 'bitch') {
			uwu = 'meanie';
		} else if (uwu === 'asshole') {
			uwu = 'b-butthole';
		} else if (uwu === 'dick' || uwu === 'penis') {
			uwu = 'peenie';
		} else if (uwu === 'cum' || uwu === 'semen') {
			uwu = 'cummies';
		} else if (uwu === 'dad' || uwu === 'father') {
			uwu = 'daddy';
		} else {
			let protectedString = '';

			if (uwu.endsWith('le') || uwu.endsWith('ll') || uwu.endsWith('er') || uwu.endsWith('re')) {
				protectedString = uwu.slice(-2);
				uwu = uwu.slice(0, -2);
			} else if (uwu.endsWith('les') || uwu.endsWith('lls') || uwu.endsWith('ers') || uwu.endsWith('res')) {
				protectedString = uwu.slice(-3);
				uwu = uwu.slice(0, -3);
			}

			uwu =
				uwu
					.replace('l', 'w')
					.replace('r', 'w')
					.replace('na', 'nya')
					.replace('ne', 'nye')
					.replace('ni', 'nyi')
					.replace('no', 'nyo')
					.replace('nu', 'nyu')
					.replace('ove', 'uv') + protectedString;
		}

		uwu += extraPunctuation + finalPunctuation;

		if (uwu.length > 2 && this.character.test(uwu[0]) && !uwu.includes('-') && !getRandomInt(7)) {
			uwu = `${uwu[0]}-${uwu}`;
		}

		return uwu;
	}
}
