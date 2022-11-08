import { createModel } from 'schemix';
import EventModel from './Event.model';
import PollModel from './Poll.model';

export default createModel('UtilityModule', (UtilityModuleModel) => {
	// prettier-ignore
	UtilityModuleModel
		.string('id', { id: true, unique: true }) // Guild ID
		.boolean('moduleEnabled')

		.relation('events', EventModel, { list: true })
		.relation('polls', PollModel, { list: true });
});
