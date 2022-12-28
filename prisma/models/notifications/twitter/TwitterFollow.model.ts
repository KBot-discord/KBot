import TwitterAccountModel from './TwitterAccount.model';
import UUIDMixin from '../../../mixins/UUID.mixin';
import NotificationModuleModel from '../NotificationModule.model';
import { createModel } from 'schemix';

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
