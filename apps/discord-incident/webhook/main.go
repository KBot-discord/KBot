package webhook

import (
	"net/http"

	config "github.com/kbot-discord/kbot/apps/discord-incident/internal"
)

type WebhookClient struct {
	Config *config.Config
	Http   *http.Client
}

func New(cfg *config.Config) *WebhookClient {
	return &WebhookClient{
		Config: cfg,
		Http:   &http.Client{},
	}
}
