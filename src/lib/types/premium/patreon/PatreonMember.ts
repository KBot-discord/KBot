import type { PatreonPatronStatus } from '#types/premium';
import type { PatreonMeta } from './PatreonMeta';

export interface PatreonMembersResponse {
	data: PatreonMemberData[];
	included: PatreonMemberIncluded[];
	meta: PatreonMeta;
}

export interface PatreonMemberData {
	type: string;
	id: string;
	relationships: PatreonMemberRelationships;
	attributes: PatreonMemberAttributes;
}

export interface PatreonMemberRelationships {
	user: {
		data: {
			type: string;
			id: string;
		};
	};
}

export interface PatreonMemberAttributes {
	full_name: string;
	is_follower: boolean;
	last_charge_date: string;
	last_charge_status: string;
	lifetime_support_cents: number;
	currently_entitled_amount_cents: number;
	patron_status: PatreonPatronStatus | null;
}

export interface PatreonMemberIncluded {
	type: string;
	id: string;
	attributes: PatreonUserAttributes;
}

export interface PatreonUserAttributes {
	email: string;
	vanity: string;
	first_name: string;
	full_name: string;
	image_url: string;
	social_connections: {
		discord: {
			user_id: string;
		};
	};
}
