// Imports
import Redis from 'ioredis';
import { container, Result } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";

// Types
import type { RedisData } from "../types/redis";
import type { RedisNamespaces } from "../types/redis";


export class RedisClient extends Redis {
    public constructor() {
        super({
            host: container.config.redis.host,
            port: container.config.redis.port,
            password: container.config.redis.password
        })

        super.once("ready", () => {
            container.logger.info("Redis client is ready.")
        })
    }

    public async fetch<T extends RedisNamespaces>(key: string) {
        const result = await Result.fromAsync(async () => {
            const raw = await this.get(key);
            if (isNullish(raw)) return raw;

            return JSON.parse(raw) as RedisData<T>;
        });

        return result.match({
            ok: (data) => data,
            err: () => null
        });
    }

    public async create<T extends RedisNamespaces>(key: string, data: RedisData<T>, ttl: number): Promise<boolean> {
        return (await this.setex(key, JSON.stringify(data), ttl)) === "OK";
    }

    public async updateExpiry(key: string, ttl: number): Promise<number> {
        return this.expire(key, ttl)
    }

    public delete(key: string): Promise<number> {
        return this.del(key)
    }

    public deleteMany(keys: string[]): Promise<number> {
        return this.del(keys)
    }

    public deleteScan<K extends RedisNamespaces>(pattern: string): void {
        this.scanStream({
            match: pattern,
        }).on('data', async (keys) => {
            if (keys.length) await this.unlink(keys);
        });
    }
}
