package server

import (
	"net/http"

	"github.com/kbot-discord/kbot/apps/discord-status/gen/discord_status/guilds/v1/guildsv1connect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

func Listen() {
	guilds := &GuildsServer{}

	mux := http.NewServeMux()

	path, handler := guildsv1connect.NewGuildServiceHandler(guilds)

	mux.Handle(path, handler)

	http.ListenAndServe(
		"localhost:8080",
		h2c.NewHandler(mux, &http2.Server{}),
	)
}
