import { container, SapphireClient } from '@sapphire/framework';
import { PrismaClient } from '@prisma/client';
import { RedisClient } from '../database/redis/RedisClient';
import { PollService } from '../../services/PollService';
import { KaraokeService } from '../../services/KaraokeService';
import type { ClientOptions } from 'discord.js';
import { YoutubeService } from '../../services/YoutubeService';
import { Validator } from '../util/validators';

export class KBotClient extends SapphireClient {
	public constructor(options: ClientOptions) {
		super(options);
		container.validator = new Validator();

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
		container.youtube = new YoutubeService();
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
