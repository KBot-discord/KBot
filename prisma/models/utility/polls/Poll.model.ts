import UtilitySettingsModel from '../UtilitySettings.model';
import { createModel } from 'schemix';

export default createModel('Poll', (model) => {
	model
		.string('id', { id: true, unique: true }) // Message id
		.string('title')
		.string('channelId')
		.bigInt('time', { optional: true })
		.string('options', { list: true })
		.dateTime('createdAt', { default: { now: true } })

		.string('guildId', { unique: true })
		.relation('utilitySettings', UtilitySettingsModel, { fields: ['guildId'], references: ['guildId'], onDelete: 'Cascade' });
});
