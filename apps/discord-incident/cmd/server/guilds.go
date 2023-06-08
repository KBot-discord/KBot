package server

import (
	"context"
	"log"

	"github.com/bufbuild/connect-go"
	"github.com/kbot-discord/kbot/apps/discord-incident/cmd/database"
	guildsv1 "github.com/kbot-discord/kbot/apps/discord-incident/gen/discord_incident/guilds/v1"
)

type GuildsServer struct{}

func (s *GuildsServer) GetGuild(
	ctx context.Context,
	req *connect.Request[guildsv1.GetGuildRequest],
) (*connect.Response[guildsv1.GetGuildResponse], error) {
	guild, err := database.Client.Guild.Get(ctx, req.Msg.GuildId)
	if err != nil {
		log.Fatalf("Error when fetching guild %v", err)
		return nil, err
	}

	res := connect.NewResponse(&guildsv1.GetGuildResponse{
		Guild: &guildsv1.Guild{
			Id:           req.Msg.GuildId,
			WebhookId:    guild.WebhookdID,
			WebhookToken: guild.WebhookdToken,
		},
	})

	return res, nil
}

func (s *GuildsServer) CreateGuild(
	ctx context.Context,
	req *connect.Request[guildsv1.CreateGuildRequest],
) (*connect.Response[guildsv1.CreateGuildResponse], error) {
	guild, err := database.Client.Guild.
		Create().
		SetID(req.Msg.Id).
		SetWebhookdID(req.Msg.WebhookId).
		SetWebhookdToken(req.Msg.WebhookToken).
		Save(ctx)
	if err != nil {
		log.Fatalf("Error when creating guild %v", err)
		return nil, err
	}

	res := connect.NewResponse(&guildsv1.CreateGuildResponse{
		Guild: &guildsv1.Guild{
			Id:           req.Msg.Id,
			WebhookId:    guild.WebhookdID,
			WebhookToken: guild.WebhookdToken,
		},
	})

	return res, nil
}

func (s *GuildsServer) DeleteGuild(
	ctx context.Context,
	req *connect.Request[guildsv1.DeleteGuildRequest],
) (*connect.Response[guildsv1.DeleteGuildResponse], error) {
	err := database.Client.Guild.DeleteOneID(req.Msg.GuildId).Exec(ctx)
	if err != nil {
		log.Fatalf("Error when creating guild %v", err)
		return nil, err
	}

	res := connect.NewResponse(&guildsv1.DeleteGuildResponse{})

	return res, nil
}
