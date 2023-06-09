package database

import (
	"context"

	"entgo.io/ent/dialect"
	"github.com/kbot-discord/kbot/apps/discord-status/ent"
	_ "github.com/mattn/go-sqlite3"
)

var Client *ent.Client

func Start() error {
	client, err := ent.Open(dialect.SQLite, "file:data.db?cache=shared&_fk=1")
	if err != nil {
		return err
	}

	defer client.Close()
	ctx := context.Background()

	if err := client.Schema.Create(ctx); err != nil {
		return err
	}

	Client = client

	return nil
}
