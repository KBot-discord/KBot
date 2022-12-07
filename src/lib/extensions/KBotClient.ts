import { container, SapphireClient } from '@sapphire/framework';
import { PrismaClient } from '@prisma/client';
import { RedisClient } from '../database/redis/RedisClient';
import { PollService } from '../../services/PollService';
import { KaraokeService } from '../../services/KaraokeService';
import { ChannelValidator } from '../util/ChannelValidator';
import type { ClientOptions } from 'discord.js';

export class KBotClient extends SapphireClient {
	public constructor(options: ClientOptions) {
		super(options);
		container.db = new PrismaClient({
			datasources: {
				database: {
					url: container.config.db.url
				}
			}
		});
		container.redis = new RedisClient();
		container.polls = new PollService();
		container.karaoke = new KaraokeService();
		container.channels = new ChannelValidator();
	}

	public override async login(token: string) {
		return super.login(token);
	}

	public override async destroy() {
		await container.db.$disconnect();
		container.redis.disconnect();
		return super.destroy();
	}
}
