// Types
import type { APIMessage } from 'discord-api-types/v10';
import type { Message } from 'discord.js';

declare module 'discord.js' {
    interface BaseCommandInteraction {
        defaultReply(text: string): Promise<void | APIMessage | Message>;
        successReply(text: string): Promise<void | APIMessage | Message>;
        errorReply(text: string): Promise<void | APIMessage | Message>;
    }
}
