package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

type Guild struct {
	ent.Schema
}

func (Guild) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			Comment("The ID of the guild"),
		field.String("webhookd_id").
			Comment("The webhook's ID"),
		field.String("webhookd_token").
			Comment("The webhook's token"),
	}
}

func (Guild) Edges() []ent.Edge {
	return nil
}
