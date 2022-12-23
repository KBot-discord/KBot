import { createModel } from 'schemix';
import UUIDMixin from '../../../mixins/UUID.mixin';
import TwitterAccountModel from './TwitterAccount.model';
import NotificationModuleModel from '../NotificationModule.model';

export default createModel('TwitterFollow', (model) => {
	// prettier-ignore
	model
		.mixin(UUIDMixin)
		.string('message')
		.string('role')
		.string('webhookId')
		.string('webhookToken')

		.string('accountId', { unique: true })
		.relation('account', TwitterAccountModel, { fields: ['accountId'], references: ['id'], onDelete: "Cascade" })
		.string('guildId', { unique: true })
		.relation('notifications', NotificationModuleModel, { fields: ['guildId'], references: ['id'], onDelete: "Cascade" })

		.id({ fields: ['id'] })
		.unique({ fields: ['webhookId', 'accountId'] });
});
