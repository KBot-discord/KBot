import { createModel } from 'schemix';
import UUIDMixin from '../../../mixins/UUID.mixin';
import TwitchChannelModel from './TwitchChannel.model';
import NotificationModuleModel from '../NotificationModule.model';

export default createModel('TwitchFollow', (model) => {
	// prettier-ignore
	model
		.mixin(UUIDMixin)
		.string('message')
		.string('role')
		.string('webhookId')
		.string('webhookToken')

		.string('channelId', { unique: true })
		.relation('channel', TwitchChannelModel, { fields: ['channelId'], references: ['id'], onDelete: "Cascade" })
		.string('guildId', { unique: true })
		.relation('notifications', NotificationModuleModel, { fields: ['guildId'], references: ['id'], onDelete: "Cascade" })

		.id({ fields: ['id']})
		.unique({ fields: ['webhookId', 'channelId'] })
});
