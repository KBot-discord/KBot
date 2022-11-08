import { createModel } from 'schemix';

export default createModel('YoutubeStream', (YoutubeStreamModel) => {
	// prettier-ignore
	YoutubeStreamModel
		.string('id', { id: true, unique: true }) // Stream ID
		.string('title')
		.string('messageIds', { list: true });
});
