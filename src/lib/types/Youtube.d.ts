import type { VideoStatus } from '#prisma';

export interface YoutubeApiChannel {
	id: string;
	name: string;
	image: string;
}

export interface YoutubeApiVideo {
	id: string;
	title: string;
	thumbnail: string;
	scheduledStartTime: Date | null;
	actualStartTime: Date | null;
	actualEndTime: Date | null;
	channelId: string;
	status: VideoStatus;
}

export interface ParsedXmlChannel {
	feed: {
		link: string[];
		id: string;
		channelId: string;
		title: string;
		author: {
			name: string;
			uri: string;
		};
		published: string;
		entry: ParsedXmlVideo[];
	};
}

export interface ParsedXmlVideo {
	id: string;
	videoId: string;
	channelId: string;
	title: string;
	link: string;
	author: {
		name: string;
		uri: string;
	};
	published: string;
	updated: string;
	group: {
		title: string;
		content: string;
		thumbnail: string;
		description: string;
		community: {
			starRating: string;
			statistics: string;
		};
	};
}

export interface FormattedXmlVideo {
	id: string;
	title: string;
	thumbnail: string;
	channelId: string;
	status: VideoStatus;
	startsAt: null;
}
