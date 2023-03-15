// Event sub
export type EventSubData =
	| { challenge: string; subscription: { type: 'stream.online' }; event: EventSubOnlineData }
	| { challenge: string; subscription: { type: 'stream.offline' }; event: EventSubOfflineData };

export interface EventSubOnlineData {
	id: string;
	broadcaster_user_id: string;
	broadcaster_user_login: string;
	broadcaster_user_name: string;
	type: TwitchStreamTypes;
	started_at: string;
}

export interface EventSubOfflineData {
	broadcaster_user_id: string;
	broadcaster_user_login: string;
	broadcaster_user_name: string;
}

export const enum TwitchStreamTypes {
	Live = 'live',
	Playlist = 'playlist',
	WatchParty = 'watch_party',
	Premiere = 'premiere',
	Rerun = 'rerun'
}

// Subscriptions
export interface TwitchApiSubscriptionResponse {
	id: string;
	status: string;
	type: string; // https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#subscription-types
	version: string;
	cost: number;
	condition: {
		broadcaster_user_id: string;
	};
	transport: {
		method: 'webhook' | 'websocket';
		callback: string; // ex: 'https://example.com/webhooks/callback'
	};
	created_at: string;
}

// Users
export interface TwitchApiUsersResponse {
	data: TwitchApiUserData[];
}

export interface TwitchApiUserData {
	id: string;
	login: string;
	display_name: string;
	profile_image_url: string;
}

// Streams
export interface TwitchApiStreamsResponse {
	data: TwitchApiStreamData[];
	pagination: {
		cursor: string;
	};
}

export interface TwitchApiStreamData {
	id: string;
	user_id: string;
	user_login: string;
	user_name: string;
	game_id: string;
	game_name: string;
	type: 'live' | '';
	title: string;
	tags: string[];
	viewer_count: number;
	started_at: string;
	language: string;
	thumbnail_url: string;
	is_mature: boolean;
}

export interface TwitchStreamData {
	type: TwitchStreamTypes;
	userId: string;
	userName: string;
	gameId: string;
	gameName: string;
	title: string;
	viewerCount: number;
	thumbnail: string;
}
