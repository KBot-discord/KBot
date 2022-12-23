import { container } from '@sapphire/framework';
import { utilityCacheKey, utilityEnabledCacheKey } from '../../util/cacheKeys';
import type { UtilityModule } from '@prisma/client';

export class UtilityRepository {
	private readonly db;
	private readonly cache;

	private readonly configKey = utilityCacheKey;
	private readonly enabledKey = utilityEnabledCacheKey;

	public constructor() {
		this.db = container.db.utilityModule;
		this.cache = container.redis;
	}

	public async getConfig(guildId: string): Promise<UtilityModule | null> {
		const key = this.configKey(guildId);
		const cacheResult = await this.cache.get<UtilityModule>(key);
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

	public async upsertConfig(guildId: string, newConfig: UtilityModule) {
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
