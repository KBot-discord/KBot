import { Command, ContextMenuCommand } from '@sapphire/framework';


const KAOMOJI_JOY = [
    ' (\\* ^ ω ^)',
    ' (o^▽^o)',
    ' (≧◡≦)',
    ' ☆⌒ヽ(\\*"､^\\*) chu',
    ' ( ˘⌣˘)♡(˘⌣˘ )',
    ' xD',
];
const KAOMOJI_EMBARRASSED = [
    ' (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)..',
    ' (\\*^.^\\*)..,',
    '..,',
    ',,,',
    '... ',
    '.. ',
    ' mmm..',
    'O.o',
];
const KAOMOJI_CONFUSE = [' (o_O)?', ' (°ロ°) !?', ' (ーー;)?', ' owo?'];
const KAOMOJI_SPARKLES = [' \\*:･ﾟ✧\\*:･ﾟ✧ ', ' ☆\\*:・ﾟ ', '〜☆ ', ' uguu.., ', ' -.-'];

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

function uwuWord(word: string) {
    word = word.toLowerCase();
    let uwu = word.replace(/[.?!,]+$/g, '');
    const punctuations = word.slice(uwu.length);
    let finalPunctuation = '';
    let extraPunctuation = '';

    if (punctuations) {
        if (punctuations.length <= 1) {
            finalPunctuation = punctuations[0];
        } else {
            finalPunctuation = punctuations[punctuations.length - 1];
            extraPunctuation = punctuations.slice(0, -1);
        }
    }
    if (finalPunctuation === '.' && !getRandomInt(4)) {
        finalPunctuation = KAOMOJI_JOY[getRandomInt(KAOMOJI_JOY.length)];
    }
    if (finalPunctuation === '?' && !getRandomInt(3)) {
        finalPunctuation = KAOMOJI_CONFUSE[getRandomInt(KAOMOJI_CONFUSE.length)];
    }
    if (finalPunctuation === '!' && !getRandomInt(3)) {
        finalPunctuation = KAOMOJI_JOY[getRandomInt(KAOMOJI_JOY.length)];
    }
    if (finalPunctuation === ',' && !getRandomInt(4)) {
        finalPunctuation = KAOMOJI_EMBARRASSED[getRandomInt(KAOMOJI_EMBARRASSED.length)];
    }
    if (finalPunctuation && !getRandomInt(5)) {
        finalPunctuation = KAOMOJI_SPARKLES[getRandomInt(KAOMOJI_SPARKLES.length)];
    }

    if (uwu === 'you\'re' || uwu === 'youre') {
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
    } else if (uwu === 'ass') {
        uwu = 'boi pussy';
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

        uwu = uwu
                .replace('l', 'w')
                .replace('r', 'w')
                .replace('na', 'nya')
                .replace('ne', 'nye')
                .replace('ni', 'nyi')
                .replace('no', 'nyo')
                .replace('nu', 'nyu')
                .replace('ove', 'uv')
            + protectedString;
    }

    uwu += extraPunctuation + finalPunctuation;

    const alpha = /[a-zA-Z]/;
    if (uwu.length > 2 && alpha.test(uwu[0]) && !uwu.includes('-') && !getRandomInt(7)) {
        uwu = `${uwu[0]}-${uwu}`;
    }
    return uwu;
}

function uwuString(string: string) {
    let converted = '';
    let currentWord = '';
    const isPrintable = /^[ -~]+$/;
    for (const word of string) {
        if (isPrintable.test(word) && word !== ' ') {
            currentWord += word;
        } else if (currentWord) {
            converted += uwuWord(currentWord) + word;
            currentWord = '';
        } else {
            converted += word;
        }
    }
    if (currentWord) {
        converted += uwuWord(currentWord);
    }
    return converted;
}

export class Uwu extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {...options });
    }

    public override registerApplicationCommands(registry: ContextMenuCommand.Registry) {
        registry.registerContextMenuCommand((builder) =>
            builder
                .setType(3)
                .setName('uwu'),
            {
                idHints: ['1035728422854467634'],
                guildIds: ['953375922990506005'],
            }
        );
    }

    public async contextMenuRun(interaction: Command.ContextMenuInteraction) {
        await interaction.deferReply();
        const message = interaction.options.getMessage('message', true);

        if (!message.content) {
            return interaction.editReply({
                content: 'There is no text to uwu-ify',
            });
        }

        const uwuText = uwuString(message.content);
        if (uwuText.length > 1999) {
            return interaction.editReply({
                content: 'Text is too long (>2000 characters)',
            });
        }
        return interaction.editReply({ content: uwuText });
    }
}