export interface PatreonCampaignsResponse {
	data: CampaignData[];
}

export interface CampaignData {
	id: string;
	type: string;
	attributes: CampaignAttributes;
}

export interface CampaignAttributes {}
