package tasks

import (
	"context"
	"log"
	"time"

	"github.com/bwmarrin/discordgo"
	"github.com/kbot-discord/kbot/apps/discord-status/webhook"
	"github.com/robfig/cron/v3"
)

func Start() {
	c := cron.New(cron.WithLocation(time.UTC))
	c.AddFunc("0 */5 * * * *", discordIncidentTask)
	c.Start()
}

func discordIncidentTask() {
	ctx := context.Background()

	result, err := fetchDiscordIncidents()
	if err != nil {
		log.Println("Error when fetching Discord incidents", err)
		return
	}

	_, err = fetchSavedIncidents(ctx, result)
	if err != nil {
		log.Println("Error when fetching database incidents", err)
		return
	}

	webhook.Client.SendMessage(&webhook.MessageCreate{
		WebhookID:    "webhook id",
		WebhookToken: "webhook token",
	}, &discordgo.WebhookParams{
		Content: "This is a message.",
	})
}
