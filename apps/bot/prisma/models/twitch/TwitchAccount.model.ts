import TwitchSubscriptionModel from './TwitchSubscription.model';
import { createModel } from 'schemix';

export default createModel('TwitchAccount', (model) => {
	model
		.string('id', { id: true, unique: true })
		.string('name')
		.string('image')
		.string('twitchSubscriptionId')

		.relation('subscriptions', TwitchSubscriptionModel, { list: true });
});
