import PremiumUserModel from './PremiumUser.model';
import UUIDMixin from '../../mixins/UUID.mixin';
import { createModel } from 'schemix';

export default createModel('PremiumClaim', (model) => {
	model
		.mixin(UUIDMixin)
		.dateTime('createdAt', { default: { now: true } })
		.dateTime('startDate', { optional: true })
		.dateTime('endDate', { optional: true })

		.string('userId', { unique: true })
		.relation('user', PremiumUserModel, { fields: ['userId'], references: ['id'], onDelete: 'NoAction' })
		.string('guildId', { unique: true })

		.id({ fields: ['id'] })
		.unique({ fields: ['userId', 'guildId'] });
});
