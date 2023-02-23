import { utilityCacheKey } from '#utils/cache';
import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { PrismaClient, UtilitySettings } from '#prisma';
import type { RedisClient } from '#lib/extensions/RedisClient';
import type { QueryByGuildId, UpsertUtilitySettingsData } from '#types/repositories';

export class UtilitySettingsRepository {
	private readonly database: PrismaClient;
	private readonly cache: RedisClient;

	private readonly settingsKey = utilityCacheKey;

	private CacheTime = container.config.db.cacheExpiry;

	public constructor() {
		this.database = container.prisma;
		this.cache = container.redis;
	}

	public async findOne({ guildId }: QueryByGuildId): Promise<UtilitySettings | null> {
		const key = this.settingsKey(guildId);

		const cacheResult = await this.cache.get<UtilitySettings>(key);
		if (!isNullish(cacheResult)) {
			await this.cache.update(key, this.CacheTime);
			return cacheResult;
		}

		const dbResult = await this.database.utilitySettings.findUnique({
			where: { guildId }
		});
		if (isNullish(dbResult)) {
			return null;
		}

		await this.cache.setEx(key, dbResult, this.CacheTime);
		return dbResult;
	}

	public async findManyWithIncidentChannel(): Promise<{ guildId: string; channelId: string }[]> {
		return this.database.utilitySettings
			.findMany({
				where: { enabled: true },
				select: { guildId: true, incidentChannelId: true }
			})
			.then((res) =>
				res //
					.filter((settings) => !isNullish(settings.incidentChannelId))
					.map(({ guildId, incidentChannelId }) => ({ guildId, channelId: incidentChannelId! }))
			);
	}

	public async upsert({ guildId }: QueryByGuildId, data: UpsertUtilitySettingsData): Promise<UtilitySettings> {
		const key = this.settingsKey(guildId);

		const settings = await this.database.utilitySettings.upsert({
			where: { guildId },
			update: data,
			create: {
				...data,
				coreSettings: {
					connectOrCreate: {
						where: { guildId },
						create: { guildId }
					}
				}
			}
		});
		await this.cache.setEx(key, settings, this.CacheTime);

		return settings;
	}
}
