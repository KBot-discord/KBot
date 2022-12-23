import { container } from '@sapphire/framework';
import { welcomeEnabledCacheKey, welcomeCacheKey } from '../../util/cacheKeys';
import type { WelcomeModule } from '@prisma/client';

export class WelcomeRepository {
	private readonly db;
	private readonly cache;

	private readonly configKey = welcomeCacheKey;
	private readonly enabledKey = welcomeEnabledCacheKey;

	public constructor() {
		this.db = container.db.welcomeModule;
		this.cache = container.redis;
	}

	public async getConfig(guildId: string): Promise<WelcomeModule | null> {
		const key = this.configKey(guildId);
		const cacheResult = await this.cache.get<WelcomeModule>(key);
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

	public async upsertConfig(guildId: string, newConfig: WelcomeModule) {
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

	public async isEnabled(guildId: string) {
		const key = this.enabledKey(guildId);
		return (await this.cache.get(key)) === 'true';
	}

	private async setEnabled(guildId: string, isEnabled: boolean) {
		const key = this.enabledKey(guildId);
		return this.cache.setEx(key, isEnabled ? 'true' : 'false', 60);
	}
}
