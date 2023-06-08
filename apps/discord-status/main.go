package main

import (
	"log"

	"github.com/kbot-discord/kbot/apps/discord-status/cmd/database"
	"github.com/kbot-discord/kbot/apps/discord-status/cmd/server"
	"github.com/kbot-discord/kbot/apps/discord-status/cmd/tasks"
	"github.com/kbot-discord/kbot/apps/discord-status/internal/config"
	"github.com/kbot-discord/kbot/apps/discord-status/internal/sentry"
)

func main() {
	cfg, err := config.Load("config.json")
	if err != nil {
		log.Fatalf("Error when loading config %v", err)
	}

	if cfg.Env != "dev" {
		sentry.Init(cfg.Sentry)
	}

	err = database.Start()
	if err != nil {
		log.Fatalf("Error when starting database %v", err)
	}

	tasks.Start()
	server.Listen()
}
