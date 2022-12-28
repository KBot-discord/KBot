import { moderationCacheKey, moderationEnabledCacheKey } from '#utils/cacheKeys';
import { container } from '@sapphire/framework';
import type { ModerationModule } from '@prisma/client';

export class ModerationRepository {
	private readonly db;
	private readonly cache;

	private readonly configKey = moderationCacheKey;
	private readonly enabledKey = moderationEnabledCacheKey;

	public constructor() {
		this.db = container.db.moderationModule;
		this.cache = container.redis;
	}

	public async getConfig(guildId: string): Promise<ModerationModule | null> {
		const key = this.configKey(guildId);
		const cacheResult = await this.cache.get<ModerationModule>(key);
		if (cacheResult) {
			await this.cache.update(key, 60);
			return cacheResult;
		}

		const dbResult = await this.db.findUnique({
			where: { id: guildId }
		});
		if (!dbResult) return null;
		await this.cache.setEx(key, dbResult, 60);
		return dbResult;
	}

	public async upsertConfig(guildId: string, newConfig: ModerationModule) {
		const key = this.configKey(guildId);
		const result = await this.db.upsert({
			where: { id: guildId },
			update: newConfig,
			create: newConfig
		});
		await this.cache.setEx(key, result, 60);
		await this.setEnabled(guildId, result.moduleEnabled);
		return result;
	}

	public async isEnabled(guildId: string): Promise<boolean> {
		const key = this.enabledKey(guildId);
		const cacheResult = await this.cache.get<string>(key);
		if (cacheResult) {
			await this.cache.update(key, 60);
			return cacheResult === 'true';
		}

		const dbResult = await this.db.findUnique({ where: { id: guildId } });
		if (!dbResult) return false;

		await this.setEnabled(guildId, dbResult.moduleEnabled);
		return dbResult.moduleEnabled;
	}

	private async setEnabled(guildId: string, isEnabled: boolean) {
		const key = this.enabledKey(guildId);
		return this.cache.setEx(key, isEnabled ? 'true' : 'false', 60);
	}
}
