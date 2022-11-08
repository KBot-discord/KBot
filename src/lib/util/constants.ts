// Imports
import { getRootData } from '@sapphire/pieces';
import { join } from 'node:path';

export const mainFolder = getRootData().root;
export const rootFolder = join(mainFolder, '..');
export const assetsFolder = join(rootFolder, 'assets');
export const imageFolder = join(assetsFolder, 'images');

export const BlankSpace = '\u200B';

export const enum embedColors {
	default = '#006BFC',
	success = '#33B54E',
	error = 'RED'
}

export const POLL_NUMBERS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export const POLL_TIME_LIMIT = 604800000; // 7 days

export const enum ArrowEmojis {
	Start = '⏪',
	Previous = '◀️',
	Next = '▶️',
	Last = '⏩',
	Stop = '⏹️'
}

export const KAOMOJI_JOY = [' (\\* ^ ω ^)', ' (o^▽^o)', ' (≧◡≦)', ' ☆⌒ヽ(\\*"､^\\*) chu', ' ( ˘⌣˘)♡(˘⌣˘ )', ' xD'];
export const KAOMOJI_EMBARRASSED = [' (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)..', ' (\\*^.^\\*)..,', '..,', ',,,', '... ', '.. ', ' mmm..', 'O.o'];
export const KAOMOJI_CONFUSE = [' (o_O)?', ' (°ロ°) !?', ' (ーー;)?', ' owo?'];
export const KAOMOJI_SPARKLES = [' \\*:･ﾟ✧\\*:･ﾟ✧ ', ' ☆\\*:・ﾟ ', '〜☆ ', ' uguu.., ', ' -.-'];

export const guildEmoteSlots: {
	[key: string]: number;
} = {
	NONE: 50,
	TIER_1: 100,
	TIER_2: 150,
	TIER_3: 250
};
export const getGuildEmoteSlots = (tier: string): number => guildEmoteSlots[tier];
