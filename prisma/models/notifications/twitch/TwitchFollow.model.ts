import TwitchChannelModel from './TwitchChannel.model';
import UUIDMixin from '../../../mixins/UUID.mixin';
import NotificationModuleModel from '../NotificationModule.model';
import { createModel } from 'schemix';

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
