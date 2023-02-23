import CoreSettingsModel from '../core/CoreSettings.model';
import { createModel } from 'schemix';

export default createModel('WelcomeSettings', (model) => {
	model
		.string('guildId', { id: true, unique: true })
		.boolean('enabled', { default: false })
		.string('channelId', { optional: true })
		.string('message', { optional: true })
		.string('title', { optional: true })
		.string('description', { optional: true })
		.string('image', { optional: true })
		.string('color', { optional: true })

		.relation('coreSettings', CoreSettingsModel, { fields: ['guildId'], references: ['guildId'], onDelete: 'Cascade' });
});
