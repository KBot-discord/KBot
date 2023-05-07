import { KAOMOJI_CONFUSE, KAOMOJI_EMBARRASSED, KAOMOJI_JOY, KAOMOJI_SPARKLES } from '#utils/constants';
import { KBotCommand, type KBotCommandOptions } from '#extensions/KBotCommand';
import { ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';
import { ApplyOptions } from '@sapphire/decorators';
import { ModuleCommand } from '@kbotdev/plugin-modules';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import type { CoreModule } from '#modules/CoreModule';

function getRandomInt(max: number) {
	return Math.floor(Math.random() * max);
}

@ApplyOptions<KBotCommandOptions>({
	module: 'CoreModule',
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	helpEmbed: (builder) => {
		return builder //
			.setName('uwu')
			.setDescription('uwu-ify a message.')
			.setTarget('message');
	}
})
export class CoreCommand extends KBotCommand<CoreModule> {
	private readonly isPrintable = /^[ -~]+$/;
	private readonly character = /[a-zA-Z]/;

	public constructor(context: ModuleCommand.Context, options: KBotCommandOptions) {
		super(context, { ...options });
	}

	public override registerApplicationCommands(registry: ModuleCommand.Registry) {
		registry.registerContextMenuCommand(
			(builder) =>
				builder //
					.setName('uwu')
					.setType(ApplicationCommandType.Message)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
					.setDMPermission(false),
			{
				idHints: [],
				guildIds: []
			}
		);
	}

	public override async contextMenuRun(interaction: ModuleCommand.ContextMenuCommandInteraction<'cached'>) {
		await interaction.deferReply();

		const message = interaction.options.getMessage('message', true);

		if (!message.content) {
			return interaction.editReply({
				content: 'There is no text to uwu-ify'
			});
		}

		const uwuText = this.convertString(message.content);
		if (uwuText.length > 1999) {
			return interaction.editReply({
				content: 'Text is too long (>2000 characters)'
			});
		}
		return interaction.editReply({ content: uwuText });
	}

	private convertString(string: string) {
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

	private convertWord(word: string) {
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
