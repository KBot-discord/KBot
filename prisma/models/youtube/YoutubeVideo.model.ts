import YoutubeMessageModel from './YoutubeMessage.model';
import YoutubeChannelModel from './YoutubeChannel.model';
import VideoStatusEnum from '../../enums/VideoStatus.enum';
import UpdatedAtMixin from '../../mixins/UpdatedAt.mixin';
import { createModel } from 'schemix';

export default createModel('YoutubeVideo', (model) => {
	model
		.string('id', { id: true, unique: true })
		.string('title')
		.string('thumbnail')
		.enum('status', VideoStatusEnum)
		.dateTime('scheduledStartTime', { optional: true })
		.dateTime('actualStartTime', { optional: true })
		.dateTime('actualEndTime', { optional: true })

		.relation('messages', YoutubeMessageModel, { list: true })
		.string('channelId')
		.relation('channel', YoutubeChannelModel, { fields: ['channelId'], references: ['id'], onDelete: 'Cascade' })

		.mixin(UpdatedAtMixin);
});
