import type { HolodexChannel } from '#prisma';

export interface HolodexChannelId {
	channelId: HolodexChannel['youtubeId'];
}

export interface HolodexTwitchlId {
	twitchId: Exclude<HolodexChannel['twitchId'], null>;
}
