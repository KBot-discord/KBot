import ModerationSettingsModel from './ModerationSettings.model';
import UUIDMixin from '../../mixins/UUID.mixin';
import ModerationActionTypeEnum from '../../enums/ModerationActionType.enum';
import { createModel } from 'schemix';

export default createModel('ModerationCase', (model) => {
	model
		.mixin(UUIDMixin)
		.int('caseId')
		.string('userId')
		.string('userTag')
		.string('moderatorId')
		.string('moderatorTag')

		.enum('type', ModerationActionTypeEnum)
		.string('reason', { default: 'No reason provided.' })
		.bigInt('duration', { optional: true })

		.string('guildId')
		.relation('moderationSettings', ModerationSettingsModel, { fields: ['guildId'], references: ['guildId'], onDelete: 'Cascade' })

		.id({ fields: ['id'] })
		.unique({ fields: ['caseId', 'guildId'] });
});
