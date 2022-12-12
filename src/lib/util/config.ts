import { container } from '@sapphire/framework';
import { config } from '../../config';
import type { Config } from '../types/config';

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

export function validateConfig(cfg: Config): boolean {
	let error = false;
	const obj = flattenConfig(cfg);
	for (const [key, value] of Object.entries(obj)) {
		if (value === undefined) {
			console.log(`Invalid value for: ${key}`);
			if (!error) error = true;
		}
	}
	return !error;
}

export function getConfig(): Config | null {
	const isConfigValid = validateConfig(config);
	if (!isConfigValid) return null;
	container.config = config;
	return config;
}

export function getGuildIds(): string[] | undefined {
	return container.config.isDev ? container.config.discord.devServers : undefined;
}
