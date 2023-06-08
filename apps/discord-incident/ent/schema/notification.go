package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

type Notification struct {
	ent.Schema
}

func (Notification) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			Comment("The ID of the notification"),
	}
}

func (Notification) Edges() []ent.Edge {
	return nil
}
