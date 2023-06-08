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

func (wc *WebhookClient) SendMessage(
	data *MessageCreate,
	payload *discordgo.WebhookParams,
) error {
	req, err := wc.createRequest(
		http.MethodPost,
		discordgo.EndpointWebhookToken(data.WebhookID, data.WebhookToken),
		payload,
	)
	if err != nil {
		return err
	}

	return wc.executeRequest(req)
}

func (wc *WebhookClient) EditMessage(
	data *MessageEdit,
	payload *discordgo.WebhookParams,
) error {
	req, err := wc.createRequest(
		http.MethodPatch,
		discordgo.EndpointWebhookMessage(data.WebhookID, data.WebhookToken, data.MessageID),
		payload,
	)
	if err != nil {
		return err
	}

	return wc.executeRequest(req)
}
