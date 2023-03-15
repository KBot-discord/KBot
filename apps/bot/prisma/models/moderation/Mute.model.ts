import ModerationSettingsModel from './ModerationSettings.model';
import UUIDMixin from '../../mixins/UUID.mixin';
import { createModel } from 'schemix';

export default createModel('Mute', (model) => {
	model
		.mixin(UUIDMixin)
		.string('userId')
		.bigInt('duration', { optional: true })
		.bigInt('evadeTime', { optional: true })

		.string('guildId')
		.relation('moderationSettings', ModerationSettingsModel, { fields: ['guildId'], references: ['guildId'], onDelete: 'Cascade' })

		.id({ fields: ['id'] })
		.unique({ fields: ['userId', 'guildId'] });
});
