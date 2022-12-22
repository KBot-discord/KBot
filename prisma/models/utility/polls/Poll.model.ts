import { createModel } from 'schemix';
import UtilityModuleModel from '../UtilityModule.model';
import PollUserModel from './PollUser.model';

export default createModel('Poll', (model) => {
	// prettier-ignore
	model
		.string('id', { id: true, unique: true }) // Message id
		.string('title')
		.string('channel')
		.bigInt('time')
		.string('options', { list: true })

		.relation('users', PollUserModel, { list: true })
		.string('guildId', { unique: true })
		.relation('utility', UtilityModuleModel, { fields: ['guildId'], references: ['id'], onDelete: "Cascade" })
});
