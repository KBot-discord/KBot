import YoutubeSubscriptionModel from './YoutubeSubscription.model';
import YoutubeStreamModel from './YoutubeVideo.model';
import { createModel } from 'schemix';

export default createModel('YoutubeChannel', (model) => {
	model
		.string('id', { id: true, unique: true })
		.string('name')
		.string('image')

		.relation('subscriptions', YoutubeSubscriptionModel, { list: true })
		.relation('streams', YoutubeStreamModel, { list: true });
});
