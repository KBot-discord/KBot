import { ChatInputModuleCommand, Module } from '@kbotdev/plugin-modules';
import { container } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import type { ModerationModule as ModerationModel } from '@prisma/client';
import type { Key } from '../lib/types/Cache';

export class ModerationModule extends Module {
	private readonly db;
	private readonly cache;

	private readonly cacheKey = (guildId: string) => `kbot:core:guilds:${guildId}:moderation:enabled` as Key;

	public constructor(context: Module.Context, options: Module.Options) {
		super(context, { ...options });
		this.db = container.db.moderationModule;
		this.cache = container.redis;
	}

	public async isEnabled(_command: ChatInputModuleCommand, guild: Guild): Promise<boolean> {
		const key = this.cacheKey(guild.id);
		const cacheResult = await this.cache.get<ModerationModel>(key);
		if (cacheResult) {
			await this.cache.update(key, 5);
			return cacheResult.moduleEnabled;
		}

		const dbResult = await this.db.findUnique({ where: { id: guild.id } });
		if (!dbResult) return false;

		return dbResult.moduleEnabled;
	}
}

declare module '@kbotdev/plugin-modules' {
	interface Modules {
		ModerationModule: never;
	}
}
