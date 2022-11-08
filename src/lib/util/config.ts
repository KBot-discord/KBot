// Imports
import { container } from '@sapphire/framework';
import type { Config, IdHints } from '../types/config';
import { config } from '../../config';

function flattenConfig(obj: any) {
	const flattenedObj: any = {};
	for (const i in obj) {
		if (!obj.hasOwnProperty(i)) continue;
		if (typeof obj[i] === 'object' && obj[i] !== null) {
			const flatObject = flattenConfig(obj[i]);
			for (const j in flatObject) {
				if (!flatObject.hasOwnProperty(j)) continue;
				flattenedObj[`${i}.${j}`] = flatObject[j];
			}
		} else {
			flattenedObj[i] = obj[i];
		}
	}
	return flattenedObj;
}

function validateConfig(): boolean {
	let error = false;
	const obj = flattenConfig(config);
	for (const [key, value] of Object.entries(obj)) {
		if (value === undefined) {
			console.log(`Invalid value for: ${key}`);
			if (!error) error = true;
		}
	}
	return !error;
}

export function getConfig(): Config | null {
	const isConfigValid = validateConfig();
	if (!isConfigValid) return null;
	container.config = config;
	return config;
}

export function getIdHints(commandName: string): string[] | undefined {
	return container.config.discord.idHints[commandName.toLowerCase() as keyof IdHints];
}

export function getGuildIds(): string[] | undefined {
	return container.config.isDev ? container.config.discord.devServers : undefined;
}
