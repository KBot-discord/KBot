package webhook

import (
	"net/http"
	"time"

	"github.com/kbot-discord/kbot/apps/discord-incident/internal/config"
)

var Client *WebhookClient

type WebhookClient struct {
	config *config.Config
	http   *http.Client
}

func New(cfg *config.Config) {
	Client = &WebhookClient{
		config: cfg,
		http: &http.Client{
			Timeout: time.Second * 10,
		},
	}
}
