import YoutubeSettingsModel from './YoutubeSettings.model';
import UUIDMixin from '../../mixins/UUID.mixin';
import HolodexChannelModel from '../holodex/HolodexChannel.model';
import { createModel } from 'schemix';

export default createModel('YoutubeSubscription', (model) => {
	model
		.mixin(UUIDMixin)
		.string('message', { optional: true })
		.string('roleId', { optional: true })
		.string('discordChannelId', { optional: true })
		.string('memberRoleId', { optional: true })
		.string('memberDiscordChannelId', { optional: true })

		.string('channelId')
		.relation('channel', HolodexChannelModel, {
			fields: ['channelId'],
			references: ['youtubeId'],
			onDelete: 'Cascade'
		})
		.string('guildId')
		.relation('youtubeSettings', YoutubeSettingsModel, {
			fields: ['guildId'],
			references: ['guildId'],
			onDelete: 'Cascade'
		})

		.id({ fields: ['id'] })
		.unique({ fields: ['channelId', 'guildId'] });
});
