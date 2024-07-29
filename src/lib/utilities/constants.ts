import { join } from 'node:path';
import { Time } from '@sapphire/duration';
import { getRootData } from '@sapphire/pieces';

export const NodeEnvironments = {
	Dev: 'development',
	Staging: 'staging',
	Production: 'production',
} as const;

export const mainFolder = getRootData().root;
export const rootFolder = join(mainFolder, '..');
export const assetsFolder = join(rootFolder, 'assets');
export const imageFolder = join(assetsFolder, 'images');
export const pluginsFolder = join(mainFolder, 'plugins');

export const DISCORD_STATUS_BASE = 'https://srhpyqt94yxb.statuspage.io/api/v2/';

export const BlankSpace = '\u200B';

export enum StatusEmbed {
	Green = '#43b581',
	Yellow = '#faa61a',
	Orange = '#f26522',
	Red = '#f04747',
	Black = '#737f8d',
}

export enum EmbedColors {
	Default = '#006BFC',
	Success = '#33B54E',
	Warning = 'Yellow',
	Error = 'Red',
	Grey = '#818C94',
}

export enum BrandColors {
	Twitch = '#9146FF ',
	Twitter = '#1DA1F2',
	Youtube = '#FF0000',
}

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
	Microphone: '🎤',
};

export const CustomEmotes = {
	Blank: '<:blank:1089252121871917149>',
	BlueSquare: '<:blue:1089252072874053702>',
};

export const GuildEmoteSlots = [50, 100, 150, 250];

export const GuildStickerSlots = [5, 15, 30, 60];

export const GuildSoundboardSlots = [8, 24, 36, 48];

export const FooterIcon = 'https://cdn.discordapp.com/avatars/918237593789947925/85a70e5d476e32cfdcccbe51f2279e17.png';

export const HexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

export const UrlRegex = /https\S*?([a-zA-Z0-9]+)(?:\.\w+)?(?:\s|$)/;

/**
 * @remarks Group 1: If the emoji is animated
 * @remarks Group 2: The name of the emoji
 * @remarks Group 3: The ID of the emoji
 */
export const EmojiRegex = /<?(a)?:?(\w{2,32}):(\d{17,20})>?/;

export const GENERIC_ERROR =
	'Woops, something went wrong. The devs have been made aware of the error and are looking into it.';

export function formGenericError(message?: string): string {
	if (!message) return GENERIC_ERROR;
	return `${message} The devs have been made aware of the error and are looking into it.`;
}
