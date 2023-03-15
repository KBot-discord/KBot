import UtilitySettingsModel from '../UtilitySettings.model';
import { createModel } from 'schemix';

export default createModel('Poll', (model) => {
	model
		.string('id', { unique: true }) // Message id
		.string('title')
		.string('channelId')
		.string('creator')
		.bigInt('time', { optional: true })
		.string('options', { list: true })
		.dateTime('createdAt', { default: { now: true } })

		.string('guildId')
		.relation('utilitySettings', UtilitySettingsModel, { fields: ['guildId'], references: ['guildId'], onDelete: 'Cascade' })

		.id({ fields: ['id', 'guildId'] });
});
