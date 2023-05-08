import type { HolodexChannel } from '@kbotdev/database';

export interface HolodexChannelId {
	channelId: HolodexChannel['youtubeId'];
}

export interface HolodexTwitchlId {
	twitchId: Exclude<HolodexChannel['twitchId'], null>;
}
