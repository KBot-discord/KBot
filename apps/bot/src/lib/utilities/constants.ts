import { Time } from '@sapphire/duration';
import { getRootData } from '@sapphire/pieces';
import { join } from 'node:path';

export const NodeEnvironments = {
	Dev: 'development',
	Staging: 'staging',
	Production: 'production'
} as const;

export const mainFolder = getRootData().root;
export const rootFolder = join(mainFolder, '..');
export const assetsFolder = join(rootFolder, 'assets');
export const imageFolder = join(assetsFolder, 'images');

export const DISCORD_STATUS_BASE = 'https://srhpyqt94yxb.statuspage.io/api/v2/';

export const BlankSpace = '\u200B';

export const enum StatusEmbed {
	Green = '#43b581',
	Yellow = '#faa61a',
	Orange = '#f26522',
	Red = '#f04747',
	Black = '#737f8d'
}

export const enum EmbedColors {
	Default = '#006BFC',
	Success = '#33B54E',
	Error = 'Red',
	Grey = '#818C94'
}

export const enum BrandColors {
	Twitch = '#9146FF ',
	Twitter = '#1DA1F2',
	Youtube = '#FF0000'
}

export const CacheValues = {
	Exists: 'EXISTS',
	DoesNotExist: 'DOES_NOT_EXIST',
	Active: 'ACTIVE',
	Inactive: 'INACTIVE'
} as const;

export const POLL_NUMBERS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export const POLL_TIME_LIMIT = Time.Month;

export const KAOMOJI_JOY = [' (* ^ ω ^)', ' (o^▽^o)', ' (≧◡≦)', ' ☆⌒ヽ(*"､^*) chu', ' ( ˘⌣˘)♡(˘⌣˘ )', ' xD'];
export const KAOMOJI_EMBARRASSED = [' (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)..', ' (*^.^*)..,', '..,', ',,,', '... ', '.. ', ' mmm..', 'O.o'];
export const KAOMOJI_CONFUSE = [' (o_O)?', ' (°ロ°) !?', ' (ーー;)?', ' owo?'];
export const KAOMOJI_SPARKLES = [' *:･ﾟ✧*:･ﾟ✧ ', ' ☆*:・ﾟ ', '〜☆ ', ' uguu.., ', ' -.-'];

export const KBotEmoji = {
	Locked: '🔒',
	Unlocked: '🔓',
	GreenCheck: '✅',
	RedX: '❌',
	Microphone: '🎤'
};

export const CustomEmotes = {
	Blank: '<:blank:1089252121871917149>',
	BlueSquare: '<:blue:1089252072874053702>'
};

export const guildEmoteSlots = [
	50, // None
	100, // Tier 1
	150, // Tier 2
	250 // Tier 3
];

export const FooterIcon = 'https://cdn.discordapp.com/avatars/918237593789947925/85a70e5d476e32cfdcccbe51f2279e17.png';
