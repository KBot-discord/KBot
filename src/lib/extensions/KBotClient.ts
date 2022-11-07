// Imports
import { container, SapphireClient } from '@sapphire/framework';
import type { ClientOptions } from 'discord.js';
import { DatabaseClient } from '../database/DatabaseClient';
import { RedisClient } from '../redis/RedisClient';
import { PollService } from '../../services/PollService';
import { KaraokeService } from '../../services/KaraokeService';

export class KBotClient extends SapphireClient {
	public constructor(options: ClientOptions) {
		super(options);
		container.db = new DatabaseClient();
		container.redis = new RedisClient();

		container.polls = new PollService();
		container.karaoke = new KaraokeService();
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
