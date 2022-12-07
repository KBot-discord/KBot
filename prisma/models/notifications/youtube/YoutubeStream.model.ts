import { createModel } from 'schemix';
import YoutubeChannelModel from './YoutubeChannel.model';

export default createModel('YoutubeStream', (model) => {
	// prettier-ignore
	model
		.string('id', { id: true, unique: true }) // Stream ID
		.string('title')
		.string('messageIds', { list: true })

		.string('channelId', { unique: true })
		.relation('channel', YoutubeChannelModel, { fields: ['channelId'], references: ['id'], onDelete: "Cascade" })
});
