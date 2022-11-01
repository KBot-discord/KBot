import { GuildData } from './index';


export interface UtilityModule {
    id: string;
    moduleEnabled: boolean;
    polls: Poll[];
    events: Event[];
    guild: GuildData;
    guildId: string;
}

export interface Poll {
    id: string;
    channel: string;
    time: string[];
    utility: UtilityModule;
    utilityId: string;
}

export interface Event {
    id: string;
    stage: string;
    pinMsg: string;
    channel: string;
    queue: string[];
    isQueueLocked: boolean;
    scheduledEvent: ScheduledEvent;
    utility: UtilityModule;
    utilityId: string;
}

export interface ScheduledEvent {
    id: string;
    scheduleId: string;
    role: string;
    channel: string;
    event: Event;
    eventId: string;
}
