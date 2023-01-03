import { RedisClient } from '../database/RedisClient';
import { Validator } from '#utils/validators';
import { PollService } from '#services/PollService';
import { KaraokeService } from '#services/KaraokeService';
import { YoutubeService } from '#services/YoutubeService';
import { ModerationService } from '#services/ModerationService';
import { UtilityService } from '#services/UtilityService';
import { NotificationService } from '#services/NotificationService';
import { container, SapphireClient } from '@sapphire/framework';
import { PrismaClient } from '@prisma/client';
import type { ClientOptions } from 'discord.js';

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

		container.moderation = new ModerationService();
		container.notifications = new NotificationService();
		container.polls = new PollService();
		container.utility = new UtilityService();
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
