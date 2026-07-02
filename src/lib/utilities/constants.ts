import { join } from 'node:path';
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

export enum EmbedColors {
	Default = '#006BFC',
	Success = '#33B54E',
	Warning = 'Yellow',
	Error = 'Red',
	Grey = '#818C94',
}

export const KAOMOJI_JOY = [' (* ^ ω ^)', ' (o^▽^o)', ' (≧◡≦)', ' ☆⌒ヽ(*"､^*) chu', ' ( ˘⌣˘)♡(˘⌣˘ )', ' xD'];
export const KAOMOJI_EMBARRASSED = [' (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)..', ' (*^.^*)..,', '..,', ',,,', '... ', '.. ', ' mmm..', 'O.o'];
export const KAOMOJI_CONFUSE = [' (o_O)?', ' (°ロ°) !?', ' (ーー;)?', ' owo?'];
export const KAOMOJI_SPARKLES = [' *:･ﾟ✧*:･ﾟ✧ ', ' ☆*:・ﾟ ', '〜☆ ', ' uguu.., ', ' -.-'];

export const GuildEmoteSlots = [50, 100, 150, 250];

export const GuildStickerSlots = [5, 15, 30, 60];

export const UrlRegex = /https\S*?([a-zA-Z0-9]+)(?:\.\w+)?(?:\s|$)/;

export const GENERIC_ERROR =
	'Woops, something went wrong. The devs have been made aware of the error and are looking into it.';

export function formGenericError(message?: string): string {
	if (!message) return GENERIC_ERROR;
	return `${message} The devs have been made aware of the error and are looking into it.`;
}
