import YoutubeVideoModel from './YoutubeVideo.model';
import YoutubeSubscriptionModel from './YoutubeSubscription.model';
import { createModel } from 'schemix';

export default createModel('YoutubeMessage', (model) => {
	model
		.string('id', { id: true, unique: true })
		.string('discordChannelId')

		.string('videoId', { unique: true })
		.relation('video', YoutubeVideoModel, { fields: ['videoId'], references: ['id'], onDelete: 'Cascade' })
		.string('subscriptionId', { unique: true, default: { uuid: true }, raw: '@database.Uuid' })
		.relation('subscription', YoutubeSubscriptionModel, { fields: ['subscriptionId'], references: ['id'], onDelete: 'Cascade' });
});
