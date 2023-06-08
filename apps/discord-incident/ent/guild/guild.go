// Code generated by ent, DO NOT EDIT.

package guild

import (
	"entgo.io/ent/dialect/sql"
)

const (
	// Label holds the string label denoting the guild type in the database.
	Label = "guild"
	// FieldID holds the string denoting the id field in the database.
	FieldID = "id"
	// FieldWebhookdID holds the string denoting the webhookd_id field in the database.
	FieldWebhookdID = "webhookd_id"
	// FieldWebhookdToken holds the string denoting the webhookd_token field in the database.
	FieldWebhookdToken = "webhookd_token"
	// Table holds the table name of the guild in the database.
	Table = "guilds"
)

// Columns holds all SQL columns for guild fields.
var Columns = []string{
	FieldID,
	FieldWebhookdID,
	FieldWebhookdToken,
}

// ValidColumn reports if the column name is valid (part of the table columns).
func ValidColumn(column string) bool {
	for i := range Columns {
		if column == Columns[i] {
			return true
		}
	}
	return false
}

// OrderOption defines the ordering options for the Guild queries.
type OrderOption func(*sql.Selector)

// ByID orders the results by the id field.
func ByID(opts ...sql.OrderTermOption) OrderOption {
	return sql.OrderByField(FieldID, opts...).ToFunc()
}

// ByWebhookdID orders the results by the webhookd_id field.
func ByWebhookdID(opts ...sql.OrderTermOption) OrderOption {
	return sql.OrderByField(FieldWebhookdID, opts...).ToFunc()
}

// ByWebhookdToken orders the results by the webhookd_token field.
func ByWebhookdToken(opts ...sql.OrderTermOption) OrderOption {
	return sql.OrderByField(FieldWebhookdToken, opts...).ToFunc()
}
