package main

import (
	"log"

	"github.com/kbot-discord/kbot/apps/discord-incident/cmd/database"
	"github.com/kbot-discord/kbot/apps/discord-incident/cmd/server"
)

func main() {
	log.Println("Started")
	database.Start()
	server.Listen()
}
