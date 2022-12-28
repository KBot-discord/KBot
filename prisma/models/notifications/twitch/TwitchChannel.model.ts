import TwitchFollowModel from './TwitchFollow.model';
import TwitchStreamModel from './TwitchStream.model';
import { createModel } from 'schemix';

export default createModel('TwitchChannel', (model) => {
	// prettier-ignore
	model
		.string('id', { id: true, unique: true }) // Twitch channel ID
		.string('name')
		.string('image')

		.relation('follows', TwitchFollowModel, { list: true })
		.relation('streams', TwitchStreamModel, { list: true });
});
