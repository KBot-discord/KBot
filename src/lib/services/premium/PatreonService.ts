import { PatreonMemberStatus, PatreonPatronStatus } from '#types/premium/patreon';
import { patreonTokenCacheKey } from '#utils/cache';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { Collection } from 'discord.js';
import { Time } from '@sapphire/duration';
import { container } from '@sapphire/framework';
import type { Snowflake } from 'discord.js';
import type {
	PatreonPatron,
	PatreonMembersResponse,
	PatreonMemberIncluded,
	PatreonToken,
	PatreonTokenResponse,
	PatreonCampaignsResponse
} from '#types/premium/patreon';

export class PatreonService {
	private readonly baseUrl = 'https://www.patreon.com/api/oauth2/v2';
	private readonly tokenUrl = 'https://www.patreon.com/api/oauth2/token';

	private readonly clientId: string;
	private readonly clientSecret: string;

	private token: PatreonToken;
	private patrons = new Collection<Snowflake, PatreonPatron>();

	public constructor() {
		const { clientId, clientSecret, accessToken, refreshToken } = container.config.premium.patreon;
		this.clientId = clientId;
		this.clientSecret = clientSecret;

		this.token = { accessToken, refreshToken };
	}

	public async run(): Promise<void> {
		const token = await this.updateToken(this.token);
		this.token = token;

		const campaigns = await this.fetchCampaigns(token);
		const campaignId = campaigns.data[0].id;

		let cursor = '';
		const newPatrons = new Collection<Snowflake, PatreonPatron>();

		do {
			const includedData = new Collection<string, PatreonMemberIncluded>();
			const members = await this.fetchCampaignMembers(token, campaignId, 200, cursor);
			container.logger.debug(`Patreon campaign fetch returned ${members.data.length} member(s)`);
			if (members.data.length === 0) return;

			for (const member of members.included) {
				includedData.set(member.id, member);
			}

			for (const member of members.data) {
				const data = includedData.get(member.id);
				const { last_charge_status, patron_status, full_name, currently_entitled_amount_cents } = member.attributes;

				if (
					!data ||
					(last_charge_status !== PatreonMemberStatus.ChargeStatusPaid && last_charge_status !== PatreonMemberStatus.ChargeStatusPending) ||
					patron_status !== PatreonPatronStatus.ActivePatron
				) {
					continue;
				}

				const { image_url, social_connections } = data.attributes;

				const patron: PatreonPatron = {
					name: full_name,
					avatar: image_url,
					cents: currently_entitled_amount_cents,
					discordId: social_connections.discord.user_id
				};

				newPatrons.set(social_connections.discord.user_id, patron);
			}

			cursor = members.meta.pagination.cursors.next;
		} while (cursor !== '');

		container.logger.debug(`There are ${newPatrons.size} patron(s)`);
		this.patrons = newPatrons;
	}

	public getPatrons(): Collection<Snowflake, PatreonPatron> {
		return this.patrons;
	}

	private async fetchCampaigns(token: PatreonToken): Promise<PatreonCampaignsResponse> {
		return fetch<PatreonCampaignsResponse>(
			`${this.baseUrl}/campaigns`,
			{
				method: FetchMethods.Get,
				headers: {
					Authorization: `Bearer ${token.accessToken}`
				}
			},
			FetchResultTypes.JSON
		);
	}

	private async fetchCampaignMembers(token: PatreonToken, campaignId: string, limit: number, cursor: string): Promise<PatreonMembersResponse> {
		const url = new URL(`${this.baseUrl}/campaigns/${campaignId}/members`);
		url.searchParams.append(
			'fields[member]',
			'full_name,is_follower,last_charge_date,last_charge_status,lifetime_support_cents,currently_entitled_amount_cents,patron_status'
		);
		url.searchParams.append(
			'fields[user]', //
			'about,created,first_name,full_name,image_url,last_name,social_connections,thumb_url,url,vanity'
		);
		url.searchParams.append('include', 'user');

		if (cursor !== '') {
			url.searchParams.append('page[cursor]', cursor);
		}

		if (limit > 0) {
			url.searchParams.append('page[count]', `${limit}`);
		}

		return fetch<PatreonMembersResponse>(
			url.href,
			{
				method: FetchMethods.Get,
				headers: {
					Authorization: `Bearer ${token.accessToken}`
				}
			},
			FetchResultTypes.JSON
		);
	}

	private async updateToken(currentToken: PatreonToken): Promise<PatreonToken> {
		let token: PatreonToken | undefined = undefined;

		if (!currentToken.expiry) {
			const result = await container.redis.get<PatreonToken>(patreonTokenCacheKey);
			if (result) {
				token = result;
			}
		}

		if (!token || (currentToken.expiry && currentToken.expiry.getTime() > Date.now())) {
			container.logger.debug('Refreshing patreon token');
			token = await this.refreshAccessToken();
		}

		return token;
	}

	private async refreshAccessToken(): Promise<PatreonToken> {
		const url = new URL(this.tokenUrl);
		url.searchParams.append('grant_type', 'refresh_token');
		url.searchParams.append('refresh_token', this.token.refreshToken);
		url.searchParams.append('client_id', this.clientId);
		url.searchParams.append('client_secret', this.clientSecret);

		const response = await fetch<PatreonTokenResponse>(
			url.href,
			{
				method: FetchMethods.Post
			},
			FetchResultTypes.JSON
		);

		return this.formatToken(response);
	}

	private formatToken(data: PatreonTokenResponse): PatreonToken {
		return {
			accessToken: data.access_token,
			refreshToken: data.refresh_token,
			expiry: new Date(Date.now() + Number(data.expires_in) - 24 * Time.Hour)
		};
	}
}
