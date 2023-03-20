import CoreSettingsModel from '../core/CoreSettings.model';
import { createModel } from 'schemix';

export default createModel('ModerationSettings', (model) => {
	model
		.string('guildId', { id: true, unique: true })
		.boolean('enabled', { default: false })
		.string('reportChannelId', { optional: true })

		.boolean('minAccountAgeEnabled', { default: false })
		.int('minAccountAgeReq', { optional: true })
		.string('minAccountAgeMsg', { optional: true })

		.boolean('antiHoistEnabled', { default: false })

		.relation('coreSettings', CoreSettingsModel, { fields: ['guildId'], references: ['guildId'], onDelete: 'Cascade' });
});
