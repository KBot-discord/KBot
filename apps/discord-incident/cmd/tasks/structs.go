package tasks

const StatusPageURL = "https://srhpyqt94yxb.statuspage.io/api/v2/incidents.json"

type StatusPageResult struct {
	Incidents []StatusPageIncident `json:"incidents"`
}

type StatusPageIncident struct {
	Id              string             `json:"id"`
	Name            string             `json:"name"`
	Status          string             `json:"status"`
	CreatedAt       string             `json:"created_at"`
	UpdatedAt       string             `json:"updated_at"`
	Impact          string             `json:"impact"`
	StartedAt       string             `json:"started_at"`
	IncidentUpdates *StatusPageUpdates `json:"incident_updates"`
	Components      string             `json:"components"`
}

type StatusPageUpdates struct {
	Status    string `json:"status"`
	Body      string `json:"body"`
	CreatedAt string `json:"created_at"`
}
