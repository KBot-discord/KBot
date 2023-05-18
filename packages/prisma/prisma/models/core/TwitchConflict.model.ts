import { createModel } from 'schemix';

export default createModel('TwitchConflict', (model) => {
	model.string('channelId', { id: true, unique: true });
});
