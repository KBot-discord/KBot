import { createModel } from 'schemix';
import TwitchFollowModel from './TwitchFollow.model';

export default createModel('TwitchChannel', (TwitchChannelModel) => {
	// prettier-ignore
	TwitchChannelModel
	.string('id', { id: true, unique: true }) // Twitch channel ID
		.string('name')
		.string('image')

		.relation('follows', TwitchFollowModel, { list: true });
});
