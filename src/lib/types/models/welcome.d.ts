import { GuildData } from './index';


export interface WelcomeModule {
    id: string;
    moduleEnabled: boolean;
    messagesEnabled: boolean;
    channel: string;
    message: string;
    title: string;
    description: string;
    image: string;
    color: string;
    guild: GuildData;
    guildId: string;
}
