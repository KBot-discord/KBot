import { createModel } from 'schemix';
import TwitchChannelModel from './TwitchChannel.model';

export default createModel('TwitchStream', (model) => {
	// prettier-ignore
	model
		.string('id', { id: true, unique: true }) // Stream ID
		.string('title')
		.string('messageIds', { list: true })

		.string('channelId', { unique: true })
		.relation('channel', TwitchChannelModel, { fields: ['channelId'], references: ['id'], onDelete: "Cascade" })
});
