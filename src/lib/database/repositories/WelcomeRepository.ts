import { welcomeEnabledCacheKey, welcomeCacheKey } from '#utils/cacheKeys';
import { container } from '@sapphire/framework';
import type { WelcomeModule } from '@prisma/client';

export class WelcomeRepository {
	private readonly db;
	private readonly cache;

	private readonly settingsKey = welcomeCacheKey;
	private readonly enabledKey = welcomeEnabledCacheKey;

	public constructor() {
		this.db = container.db.welcomeModule;
		this.cache = container.redis;
	}

	public async getSettings(guildId: string): Promise<WelcomeModule | null> {
		const key = this.settingsKey(guildId);

		const cacheResult = await this.cache.get(key);
		if (cacheResult) {
			await this.cache.update(key, 60);
			if (cacheResult === 'null') return null;
			return cacheResult as WelcomeModule;
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

	public async upsertSettings(guildId: string, newSettings: WelcomeModule) {
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

	public async isEnabled(guildId: string) {
		const key = this.enabledKey(guildId);
		return (await this.cache.get(key)) === 'true';
	}

	private async setEnabled(guildId: string, isEnabled: boolean) {
		const key = this.enabledKey(guildId);
		return this.cache.setEx(key, isEnabled, 60);
	}
}
