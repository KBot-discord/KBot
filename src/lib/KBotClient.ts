import { SapphireClient } from '@sapphire/framework';
import { Counters } from "./types/client";

export class KBotClient extends SapphireClient {
    public dev = process.env.NODE_ENV === 'production';

    public override async login(token: string) {
        return super.login(token);
    }

    public async destroy() {
        return super.destroy();
    }
}

declare module '@sapphire/pieces' {
    interface Container {
        counters: Counters;
    }
}