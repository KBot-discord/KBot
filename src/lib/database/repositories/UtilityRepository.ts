import { utilityCacheKey, utilityEnabledCacheKey } from '#utils/cacheKeys';
import { container } from '@sapphire/framework';
import type { UtilityModule } from '@prisma/client';

export class UtilityRepository {
	private readonly db;
	private readonly cache;

	private readonly settingsKey = utilityCacheKey;
	private readonly enabledKey = utilityEnabledCacheKey;

	public constructor() {
		this.db = container.db.utilityModule;
		this.cache = container.redis;
	}

	public async getSettings(guildId: string): Promise<UtilityModule | null> {
		const key = this.settingsKey(guildId);

		const cacheResult = await this.cache.get(key);
		if (cacheResult) {
			await this.cache.update(key, 60);
			if (cacheResult === 'null') return null;
			return cacheResult as UtilityModule;
		}

		const dbResult = await this.db.findUnique({
			where: { id: guildId }
		});
		if (!dbResult) {
			await this.cache.setEx(key, null, 60);
			return null;
		}

		await this.cache.setEx(key, dbResult, 60);
		return dbResult;
	}

	public async upsertSettings(guildId: string, newSettings: UtilityModule) {
		const key = this.settingsKey(guildId);

		const result = await this.db.upsert({
			where: { id: guildId },
			update: newSettings,
			create: newSettings
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
		if (!dbResult) {
			await this.setEnabled(guildId, false);
			return false;
		}

		await this.setEnabled(guildId, dbResult.moduleEnabled);
		return dbResult.moduleEnabled;
	}

	private async setEnabled(guildId: string, isEnabled: boolean) {
		const key = this.enabledKey(guildId);
		return this.cache.setEx(key, isEnabled, 60);
	}
}
