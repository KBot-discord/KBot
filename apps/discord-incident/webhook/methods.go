package webhook

import (
	"net/http"

	"github.com/bwmarrin/discordgo"
)

type MessageCreate struct {
	WebhookID    string
	WebhookToken string
}

type MessageEdit struct {
	WebhookID    string
	WebhookToken string
	MessageID    string
}

func SendMessage(wc *WebhookClient, w *MessageCreate, p *discordgo.WebhookParams) error {
	req, err := CreateRequest(
		wc,
		http.MethodPost,
		discordgo.EndpointWebhookToken(w.WebhookID, w.WebhookToken),
		p,
	)
	if err != nil {
		return err
	}

	return ExecuteRequest(wc, req)
}

func EditMessage(wc *WebhookClient, w *MessageEdit, p *discordgo.WebhookParams) error {
	req, err := CreateRequest(
		wc,
		http.MethodPatch,
		discordgo.EndpointWebhookMessage(w.WebhookID, w.WebhookToken, w.MessageID),
		p,
	)
	if err != nil {
		return err
	}

	return ExecuteRequest(wc, req)
}
