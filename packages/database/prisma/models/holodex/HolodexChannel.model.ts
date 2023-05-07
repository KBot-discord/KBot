import YoutubeSubscriptionModel from '../youtube/YoutubeSubscription.model';
import { createModel } from 'schemix';

export default createModel('HolodexChannel', (model) => {
	model
		.string('youtubeId', { id: true, unique: true })
		.string('twitchId', { optional: true, unique: true })
		.string('name')
		.string('englishName', { optional: true })
		.string('image', { optional: true })

		.string('twitchSubscriptionId', { optional: true })

		.relation('youtubeSubscriptions', YoutubeSubscriptionModel, { list: true });
});
