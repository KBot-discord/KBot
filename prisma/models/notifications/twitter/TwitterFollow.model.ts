import { createModel } from 'schemix';
import UUIDMixin from '../../../mixins/UUID.mixin';
import TwitterAccountModel from './TwitterAccount.model';
import NotificationModuleModel from '../NotificationModule.model';

export default createModel('TwitterFollow', (TwitterFollowModel) => {
	// prettier-ignore
	TwitterFollowModel
		.mixin(UUIDMixin)
		.string('message')
		.string('webhookId')
		.string('webhookToken')

		.string('accountId', { unique: true })
		.relation('account', TwitterAccountModel, { fields: ['accountId'], references: ['id'] })
		.string('guildId', { unique: true })
		.relation('notifications', NotificationModuleModel, { fields: ['guildId'], references: ['id'] })

		.id({ fields: ['accountId', 'guildId'] });
});
