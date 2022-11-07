import { createModel } from 'schemix';
import UtilityModuleModel from './UtilityModule.model';
import EventUser from './EventUser.model';

export default createModel('Event', (EventModel) => {
	// prettier-ignore
	EventModel
		.string('id', { unique: true }) // Voice channel id
		.string('channel')
		.boolean('locked')
		.boolean('isActive')
		.string('pinMsg', { optional: true })
		.string('scheduleId', { optional: true })
		.string('role', { optional: true })

		.relation('queue', EventUser, { list: true })
		.string('guildId', { unique: true })
		.relation('utility', UtilityModuleModel, { fields: ['guildId'], references: ['id'] })

		.id({ fields: ['id', 'guildId'] });
});
