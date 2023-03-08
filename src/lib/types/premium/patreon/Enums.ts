export const enum PatreonMemberStatus {
	ChargeStatusPaid = 'Paid',
	ChargeStatusDeclined = 'Declined',
	ChargeStatusDeleted = 'Deleted',
	ChargeStatusPending = 'Pending',
	ChargeStatusRefunded = 'Refunded',
	ChargeStatusFraud = 'Fraud',
	ChargeStatusOther = 'Other'
}

export const enum PatreonPatronStatus {
	ActivePatron = 'active_patron',
	DeclinedPatron = 'declined_patron',
	FormerPatron = 'former_patron'
}
