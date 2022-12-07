import { createModel } from 'schemix';
import UUIDMixin from '../../../mixins/UUID.mixin';
import YoutubeChannelModel from './YoutubeChannel.model';
import NotificationModuleModel from '../NotificationModule.model';

export default createModel('YoutubeSubscription', (model) => {
	// prettier-ignore
	model
		.mixin(UUIDMixin)
		.string('message')
		.string('role')
		.string('webhookId')
		.string('webhookToken')

		.string('channelId', { unique: true })
		.relation('channel', YoutubeChannelModel, { fields: ['channelId'], references: ['id'], onDelete: "Cascade" })
		.string('guildId', { unique: true })
		.relation('notifications', NotificationModuleModel, { fields: ['guildId'], references: ['id'], onDelete: "Cascade" })

		.id({ fields: ['id'] })
		.unique({ fields: ['webhookId', 'channelId'] });
});
