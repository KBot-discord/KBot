export interface PatreonTokenResponse {
	access_token: string;
	refresh_token: string;
	expires_in: string;
	scope: string[];
	token_type: 'Bearer';
}

export interface PatreonToken {
	accessToken: string;
	refreshToken: string;
	expiry?: Date;
}
