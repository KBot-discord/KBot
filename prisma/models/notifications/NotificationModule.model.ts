import { createModel } from 'schemix';
import TwitterFollowModel from './twitter/TwitterFollow.model';
import TwitchFollowModel from './twitch/TwitchFollow.model';
import GuildModel from '../Guild.model';

export default createModel('NotificationModule', (model) => {
	// prettier-ignore
	model
		.string('id', { id: true, unique: true }) // Guild ID
		.boolean('moduleEnabled', { default: true })

		.relation('twitter', TwitterFollowModel, { list: true })
		.relation('twitch', TwitchFollowModel, { list: true })

		.relation('guild', GuildModel, { fields: ['id'], references: ['id'], onDelete: 'Cascade' })
});
