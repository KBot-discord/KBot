package tasks

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/kbot-discord/kbot/apps/discord-status/cmd/database"
	"github.com/kbot-discord/kbot/apps/discord-status/ent"
	"github.com/kbot-discord/kbot/apps/discord-status/ent/incident"
)

func (i StatusPageResult) IncidentIds() []string {
	var list []string
	for _, incident := range i.Incidents {
		list = append(list, incident.Id)
	}
	return list
}

func fetchDiscordIncidents() (*StatusPageResult, error) {
	resp, err := http.Get(StatusPageURL)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error when reading body", err)
		return nil, err
	}

	var data StatusPageResult
	if err := json.Unmarshal(body, &data); err != nil {
		log.Println("Cannot unmarshal JSON", err)
		return nil, err
	}

	return &data, nil
}

func fetchSavedIncidents(ctx context.Context, result *StatusPageResult) ([]*ent.Incident, error) {
	return database.Client.Incident.
		Query().
		Where(incident.IDIn(result.IncidentIds()...)).
		All(ctx)
}
