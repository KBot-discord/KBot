import { SapphireClientOptions } from "@sapphire/framework";


declare module 'discord.js' {
    interface Client {
    }

    interface ClientOptions extends SapphireClientOptions {
    }
}