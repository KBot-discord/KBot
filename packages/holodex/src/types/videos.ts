import type { HolodexChannelMin } from './channels';

export interface HolodexVideo {
	available_at: string;
	duration: number;
	id: string;
	published_at: string | null;
	start_actual: string | null;
	start_scheduled: string | null;
	status: 'new' | 'upcoming' | 'live' | 'past' | 'missing';
	title: string;
	topic_id: string | null;
	type: 'stream' | 'clip';
	description: string | null;
}

export interface HolodexVideoWithChannel extends HolodexVideo {
	channel: HolodexChannelMin;
}
