package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

type Incident struct {
	ent.Schema
}

func (Incident) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").
			Comment("The ID of the incident"),
	}
}

func (Incident) Edges() []ent.Edge {
	return nil
}
