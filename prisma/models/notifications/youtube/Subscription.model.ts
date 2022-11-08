import { createModel } from 'schemix';
import UUIDMixin from '../../../mixins/UUID.mixin';
import YoutubeChannelModel from './YoutubeChannel.model';
import NotificationModuleModel from '../NotificationModule.model';

export default createModel('YoutubeSubscription', (SubscriptionModel) => {
	// prettier-ignore
	SubscriptionModel
		.mixin(UUIDMixin)
		.string('message')
		.string('webhookId')
		.string('webhookToken')

		.string('channelId', { unique: true })
		.relation('channel', YoutubeChannelModel, { fields: ['channelId'], references: ['id'] })
		.string('guildId', { unique: true })
		.relation('notifications', NotificationModuleModel, { fields: ['guildId'], references: ['id'] })

		.id({ fields: ['channelId', 'guildId'] });
});
