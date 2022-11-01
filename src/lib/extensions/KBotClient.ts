// Imports
import { container, SapphireClient } from '@sapphire/framework';
import { DatabaseClient } from '../database/DatabaseClient';
import { RedisClient } from '../redis/RedisClient';

// Types
import type { ClientOptions } from 'discord.js';
import type { Config } from '../types/config';
import type { Counters } from '../types/client';


export class KBotClient extends SapphireClient {
    public constructor(options: ClientOptions) {
        super(options);
        container.db = new DatabaseClient(container.config.db.url);
        container.redis = new RedisClient();
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

declare module '@sapphire/pieces' {
    interface Container {
        db: DatabaseClient;
        redis: RedisClient;
        config: Config;
        counters: Counters;
    }
}
