package server

import (
	"context"

	"github.com/bufbuild/connect-go"
	guildsv1 "github.com/kbot-discord/kbot/apps/discord-incident/gen/discord_incident/guilds/v1"
)

type GuildsServer struct{}

func (s *GuildsServer) GetGuild(
	ctx context.Context,
	req *connect.Request[guildsv1.GetGuildRequest],
) (*connect.Response[guildsv1.GetGuildResponse], error) {
	res := connect.NewResponse(&guildsv1.GetGuildResponse{
		Guild: &guildsv1.Guild{
			Id:           "guild id",
			WebhookId:    "webhook id",
			WebhookToken: "webhook token",
		},
	})

	return res, nil
}

func (s *GuildsServer) CreateGuild(
	ctx context.Context,
	req *connect.Request[guildsv1.CreateGuildRequest],
) (*connect.Response[guildsv1.CreateGuildResponse], error) {
	res := connect.NewResponse(&guildsv1.CreateGuildResponse{
		Guild: &guildsv1.Guild{
			Id:           "guild id",
			WebhookId:    "webhook id",
			WebhookToken: "webhook token",
		},
	})

	return res, nil
}

func (s *GuildsServer) DeleteGuild(
	ctx context.Context,
	req *connect.Request[guildsv1.DeleteGuildRequest],
) (*connect.Response[guildsv1.DeleteGuildResponse], error) {
	res := connect.NewResponse(&guildsv1.DeleteGuildResponse{
		Guild: &guildsv1.Guild{
			Id:           "guild id",
			WebhookId:    "webhook id",
			WebhookToken: "webhook token",
		},
	})

	return res, nil
}
