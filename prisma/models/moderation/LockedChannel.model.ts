import ModerationSettingsModel from './ModerationSettings.model';
import { createModel } from 'schemix';

export default createModel('LockedChannel', (model) => {
	model
		.string('id', { id: true, unique: true }) // Channel ID
		.string('roleId')
		.bigInt('duration', { optional: true })

		.string('guildId', { unique: true })
		.relation('moderationSettings', ModerationSettingsModel, { fields: ['guildId'], references: ['guildId'], onDelete: 'Cascade' });
});
