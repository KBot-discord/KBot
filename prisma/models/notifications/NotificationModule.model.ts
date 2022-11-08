import { createModel } from 'schemix';
import TwitterFollowModel from './twitter/TwitterFollow.model';
import SubscriptionModel from './youtube/Subscription.model';
import TwitchFollowModel from './twitch/TwitchFollow.model';

export default createModel('NotificationModule', (model) => {
	// prettier-ignore
	model
		.string('id', { id: true, unique: true }) // Guild ID
		.boolean('moduleEnabled')

		.relation('twitter', TwitterFollowModel, { list: true })
		.relation('youtube', SubscriptionModel, { list: true })
		.relation('twitch', TwitchFollowModel, { list: true });
});
