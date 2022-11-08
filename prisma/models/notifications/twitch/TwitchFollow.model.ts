import { createModel } from 'schemix';
import UUIDMixin from '../../../mixins/UUID.mixin';
import TwitchChannelModel from './TwitchChannel.model';
import NotificationModuleModel from '../NotificationModule.model';

export default createModel('TwitchFollow', (TwitchFollowModel) => {
	// prettier-ignore
	TwitchFollowModel
		.mixin(UUIDMixin)
		.string('message')
		.string('webhookId')
		.string('webhookToken')

		.string('channelId', { unique: true })
		.relation('channel', TwitchChannelModel, { fields: ['channelId'], references: ['id'] })
		.string('guildId', { unique: true })
		.relation('notifications', NotificationModuleModel, { fields: ['guildId'], references: ['id'] })

		.id({ fields: ['channelId', 'guildId'] });
});
