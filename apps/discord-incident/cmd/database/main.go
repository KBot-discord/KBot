package database

import (
	"context"
	"log"

	"entgo.io/ent/dialect"
	"github.com/kbot-discord/kbot/apps/discord-incident/ent"
	_ "github.com/mattn/go-sqlite3"
)

func Start() *ent.Client {
	client, err := ent.Open(dialect.SQLite, "file:data.db?cache=shared&_fk=1")
	if err != nil {
		log.Fatalf("failed opening connection to sqlite: %v", err)
	}

	defer client.Close()
	ctx := context.Background()

	if err := client.Schema.Create(ctx); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
	}

	return client
}
