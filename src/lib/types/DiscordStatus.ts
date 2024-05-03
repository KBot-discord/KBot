export type StatusPageResult = {
	incidents: StatusPageIncident[];
};

export type StatusPageIncident = {
	id: string;
	name: string;
	status: 'identified' | 'investigating' | 'monitoring' | 'postmortem' | 'resolved';
	created_at: string;
	updated_at: string | null;
	impact: 'critical' | 'major' | 'minor' | 'none';
	started_at: string;
	incident_updates: {
		status: string;
		body: string;
		created_at: string;
	}[];
	components: { name: string }[];
};
