import { createModel } from 'schemix';

export default createModel('TwitchStream', (TwitchStreamModel) => {
	// prettier-ignore
	TwitchStreamModel
		.string('id', { id: true, unique: true }) // Stream ID
		.string('title')
		.string('messageIds', { list: true });
});
