import { createModel } from 'schemix';

export default createModel('Blacklist', (model) => {
	model.string('guildId', { id: true, unique: true });
});
