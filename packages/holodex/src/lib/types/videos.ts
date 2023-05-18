import type { HolodexChannelMin } from './channels';

export type HolodexVideo = {
	available_at: string;
	duration: number;
	id: string;
	published_at: string | null;
	start_actual: string | null;
	start_scheduled: string | null;
	status: 'live' | 'missing' | 'new' | 'past' | 'upcoming';
	title: string;
	topic_id: string | null;
	type: 'clip' | 'stream';
	description: string | null;
};

export type HolodexVideoWithChannel = HolodexVideo & {
	channel: HolodexChannelMin;
};
