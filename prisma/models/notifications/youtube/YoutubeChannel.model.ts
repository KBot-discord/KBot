import { createModel } from 'schemix';
import SubscriptionModel from './Subscription.model';

export default createModel('YoutubeChannel', (YoutubeChannelModel) => {
	// prettier-ignore
	YoutubeChannelModel
		.string('id', { id: true, unique: true })
		.string('name')
		.string('image')

		.relation('subscriptions', SubscriptionModel, { list: true });
});
