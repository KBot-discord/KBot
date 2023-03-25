export interface StatusPageResult {
	incidents: StatusPageIncident[];
}

export interface StatusPageIncident {
	id: string;
	name: string;
	status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';
	created_at: string;
	updated_at: string | null;
	impact: 'none' | 'minor' | 'major' | 'critical';
	started_at: string;
	incident_updates: {
		status: string;
		body: string;
		created_at: string;
	}[];
	components: { name: string }[];
}
