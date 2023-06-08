// Code generated by ent, DO NOT EDIT.

package guild

import (
	"entgo.io/ent/dialect/sql"
	"github.com/kbot-discord/kbot/apps/discord-incident/ent/predicate"
)

// ID filters vertices based on their ID field.
func ID(id string) predicate.Guild {
	return predicate.Guild(sql.FieldEQ(FieldID, id))
}

// IDEQ applies the EQ predicate on the ID field.
func IDEQ(id string) predicate.Guild {
	return predicate.Guild(sql.FieldEQ(FieldID, id))
}

// IDNEQ applies the NEQ predicate on the ID field.
func IDNEQ(id string) predicate.Guild {
	return predicate.Guild(sql.FieldNEQ(FieldID, id))
}

// IDIn applies the In predicate on the ID field.
func IDIn(ids ...string) predicate.Guild {
	return predicate.Guild(sql.FieldIn(FieldID, ids...))
}

// IDNotIn applies the NotIn predicate on the ID field.
func IDNotIn(ids ...string) predicate.Guild {
	return predicate.Guild(sql.FieldNotIn(FieldID, ids...))
}

// IDGT applies the GT predicate on the ID field.
func IDGT(id string) predicate.Guild {
	return predicate.Guild(sql.FieldGT(FieldID, id))
}

// IDGTE applies the GTE predicate on the ID field.
func IDGTE(id string) predicate.Guild {
	return predicate.Guild(sql.FieldGTE(FieldID, id))
}

// IDLT applies the LT predicate on the ID field.
func IDLT(id string) predicate.Guild {
	return predicate.Guild(sql.FieldLT(FieldID, id))
}

// IDLTE applies the LTE predicate on the ID field.
func IDLTE(id string) predicate.Guild {
	return predicate.Guild(sql.FieldLTE(FieldID, id))
}

// IDEqualFold applies the EqualFold predicate on the ID field.
func IDEqualFold(id string) predicate.Guild {
	return predicate.Guild(sql.FieldEqualFold(FieldID, id))
}

// IDContainsFold applies the ContainsFold predicate on the ID field.
func IDContainsFold(id string) predicate.Guild {
	return predicate.Guild(sql.FieldContainsFold(FieldID, id))
}

// WebhookdID applies equality check predicate on the "webhookd_id" field. It's identical to WebhookdIDEQ.
func WebhookdID(v string) predicate.Guild {
	return predicate.Guild(sql.FieldEQ(FieldWebhookdID, v))
}

// WebhookdToken applies equality check predicate on the "webhookd_token" field. It's identical to WebhookdTokenEQ.
func WebhookdToken(v string) predicate.Guild {
	return predicate.Guild(sql.FieldEQ(FieldWebhookdToken, v))
}

// WebhookdIDEQ applies the EQ predicate on the "webhookd_id" field.
func WebhookdIDEQ(v string) predicate.Guild {
	return predicate.Guild(sql.FieldEQ(FieldWebhookdID, v))
}

// WebhookdIDNEQ applies the NEQ predicate on the "webhookd_id" field.
func WebhookdIDNEQ(v string) predicate.Guild {
	return predicate.Guild(sql.FieldNEQ(FieldWebhookdID, v))
}

// WebhookdIDIn applies the In predicate on the "webhookd_id" field.
func WebhookdIDIn(vs ...string) predicate.Guild {
	return predicate.Guild(sql.FieldIn(FieldWebhookdID, vs...))
}

// WebhookdIDNotIn applies the NotIn predicate on the "webhookd_id" field.
func WebhookdIDNotIn(vs ...string) predicate.Guild {
	return predicate.Guild(sql.FieldNotIn(FieldWebhookdID, vs...))
}

// WebhookdIDGT applies the GT predicate on the "webhookd_id" field.
func WebhookdIDGT(v string) predicate.Guild {
	return predicate.Guild(sql.FieldGT(FieldWebhookdID, v))
}

// WebhookdIDGTE applies the GTE predicate on the "webhookd_id" field.
func WebhookdIDGTE(v string) predicate.Guild {
	return predicate.Guild(sql.FieldGTE(FieldWebhookdID, v))
}

// WebhookdIDLT applies the LT predicate on the "webhookd_id" field.
func WebhookdIDLT(v string) predicate.Guild {
	return predicate.Guild(sql.FieldLT(FieldWebhookdID, v))
}

// WebhookdIDLTE applies the LTE predicate on the "webhookd_id" field.
func WebhookdIDLTE(v string) predicate.Guild {
	return predicate.Guild(sql.FieldLTE(FieldWebhookdID, v))
}

// WebhookdIDContains applies the Contains predicate on the "webhookd_id" field.
func WebhookdIDContains(v string) predicate.Guild {
	return predicate.Guild(sql.FieldContains(FieldWebhookdID, v))
}

// WebhookdIDHasPrefix applies the HasPrefix predicate on the "webhookd_id" field.
func WebhookdIDHasPrefix(v string) predicate.Guild {
	return predicate.Guild(sql.FieldHasPrefix(FieldWebhookdID, v))
}

// WebhookdIDHasSuffix applies the HasSuffix predicate on the "webhookd_id" field.
func WebhookdIDHasSuffix(v string) predicate.Guild {
	return predicate.Guild(sql.FieldHasSuffix(FieldWebhookdID, v))
}

// WebhookdIDEqualFold applies the EqualFold predicate on the "webhookd_id" field.
func WebhookdIDEqualFold(v string) predicate.Guild {
	return predicate.Guild(sql.FieldEqualFold(FieldWebhookdID, v))
}

// WebhookdIDContainsFold applies the ContainsFold predicate on the "webhookd_id" field.
func WebhookdIDContainsFold(v string) predicate.Guild {
	return predicate.Guild(sql.FieldContainsFold(FieldWebhookdID, v))
}

// WebhookdTokenEQ applies the EQ predicate on the "webhookd_token" field.
func WebhookdTokenEQ(v string) predicate.Guild {
	return predicate.Guild(sql.FieldEQ(FieldWebhookdToken, v))
}

// WebhookdTokenNEQ applies the NEQ predicate on the "webhookd_token" field.
func WebhookdTokenNEQ(v string) predicate.Guild {
	return predicate.Guild(sql.FieldNEQ(FieldWebhookdToken, v))
}

// WebhookdTokenIn applies the In predicate on the "webhookd_token" field.
func WebhookdTokenIn(vs ...string) predicate.Guild {
	return predicate.Guild(sql.FieldIn(FieldWebhookdToken, vs...))
}

// WebhookdTokenNotIn applies the NotIn predicate on the "webhookd_token" field.
func WebhookdTokenNotIn(vs ...string) predicate.Guild {
	return predicate.Guild(sql.FieldNotIn(FieldWebhookdToken, vs...))
}

// WebhookdTokenGT applies the GT predicate on the "webhookd_token" field.
func WebhookdTokenGT(v string) predicate.Guild {
	return predicate.Guild(sql.FieldGT(FieldWebhookdToken, v))
}

// WebhookdTokenGTE applies the GTE predicate on the "webhookd_token" field.
func WebhookdTokenGTE(v string) predicate.Guild {
	return predicate.Guild(sql.FieldGTE(FieldWebhookdToken, v))
}

// WebhookdTokenLT applies the LT predicate on the "webhookd_token" field.
func WebhookdTokenLT(v string) predicate.Guild {
	return predicate.Guild(sql.FieldLT(FieldWebhookdToken, v))
}

// WebhookdTokenLTE applies the LTE predicate on the "webhookd_token" field.
func WebhookdTokenLTE(v string) predicate.Guild {
	return predicate.Guild(sql.FieldLTE(FieldWebhookdToken, v))
}

// WebhookdTokenContains applies the Contains predicate on the "webhookd_token" field.
func WebhookdTokenContains(v string) predicate.Guild {
	return predicate.Guild(sql.FieldContains(FieldWebhookdToken, v))
}

// WebhookdTokenHasPrefix applies the HasPrefix predicate on the "webhookd_token" field.
func WebhookdTokenHasPrefix(v string) predicate.Guild {
	return predicate.Guild(sql.FieldHasPrefix(FieldWebhookdToken, v))
}

// WebhookdTokenHasSuffix applies the HasSuffix predicate on the "webhookd_token" field.
func WebhookdTokenHasSuffix(v string) predicate.Guild {
	return predicate.Guild(sql.FieldHasSuffix(FieldWebhookdToken, v))
}

// WebhookdTokenEqualFold applies the EqualFold predicate on the "webhookd_token" field.
func WebhookdTokenEqualFold(v string) predicate.Guild {
	return predicate.Guild(sql.FieldEqualFold(FieldWebhookdToken, v))
}

// WebhookdTokenContainsFold applies the ContainsFold predicate on the "webhookd_token" field.
func WebhookdTokenContainsFold(v string) predicate.Guild {
	return predicate.Guild(sql.FieldContainsFold(FieldWebhookdToken, v))
}

// And groups predicates with the AND operator between them.
func And(predicates ...predicate.Guild) predicate.Guild {
	return predicate.Guild(func(s *sql.Selector) {
		s1 := s.Clone().SetP(nil)
		for _, p := range predicates {
			p(s1)
		}
		s.Where(s1.P())
	})
}

// Or groups predicates with the OR operator between them.
func Or(predicates ...predicate.Guild) predicate.Guild {
	return predicate.Guild(func(s *sql.Selector) {
		s1 := s.Clone().SetP(nil)
		for i, p := range predicates {
			if i > 0 {
				s1.Or()
			}
			p(s1)
		}
		s.Where(s1.P())
	})
}

// Not applies the not operator on the given predicate.
func Not(p predicate.Guild) predicate.Guild {
	return predicate.Guild(func(s *sql.Selector) {
		p(s.Not())
	})
}