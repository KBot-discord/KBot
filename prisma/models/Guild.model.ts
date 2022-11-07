import { createModel } from 'schemix';

export default createModel('Guild', (GuildModel) => {
	// prettier-ignore
	GuildModel
		.string('id', { id: true, unique: true }) // Guild ID
		.string('staffRoles', { list: true })
		.string('botManagers', { list: true })
		.dateTime('createdAt', { default: { now: true } });
});
