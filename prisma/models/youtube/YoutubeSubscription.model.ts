import YoutubeChannelModel from './YoutubeChannel.model';
import YoutubeMessageModel from './YoutubeMessage.model';
import YoutubeSettingsModel from './YoutubeSettings.model';
import UUIDMixin from '../../mixins/UUID.mixin';
import { createModel } from 'schemix';

export default createModel('YoutubeSubscription', (model) => {
	model
		.mixin(UUIDMixin)
		.string('message', { optional: true })
		.string('roleId', { optional: true })
		.string('discordChannelId', { optional: true })

		.relation('messages', YoutubeMessageModel, { list: true })
		.string('channelId')
		.relation('channel', YoutubeChannelModel, { fields: ['channelId'], references: ['id'], onDelete: 'Cascade' })
		.string('guildId', { unique: true })
		.relation('youtubeSettings', YoutubeSettingsModel, { fields: ['guildId'], references: ['guildId'], onDelete: 'Cascade' })

		.id({ fields: ['id'] })
		.unique({ fields: ['channelId', 'guildId'] });
});
