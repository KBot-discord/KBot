import { SapphireClientOptions } from '@sapphire/framework';
import { Counter, Histogram } from 'prom-client';

declare module 'discord.js' {
    interface Client {
    }

    interface ClientOptions extends SapphireClientOptions {
    }
}

export interface Counters {
    youtube: {
        total: Counter;
        success: Counter;
    };
}
