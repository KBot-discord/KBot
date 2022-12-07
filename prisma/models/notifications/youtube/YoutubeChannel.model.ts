import { createModel } from 'schemix';
import SubscriptionModel from './Subscription.model';
import YoutubeStreamModel from './YoutubeStream.model';

export default createModel('YoutubeChannel', (model) => {
	// prettier-ignore
	model
		.string('id', { id: true, unique: true })
		.string('name')
		.string('image')

		.relation('subscriptions', SubscriptionModel, { list: true })
		.relation('streams', YoutubeStreamModel, { list: true })
});
