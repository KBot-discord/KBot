import ModerationModuleMode from './ModerationModule.model';
import UUIDMixin from '../../mixins/UUID.mixin';
import { createModel } from 'schemix';

export default createModel('Mute', (model) => {
	// prettier-ignore
	model
		.mixin(UUIDMixin)
		.string('userId', { id: true, unique: true })
		.bigInt('time')
		.bigInt('evadeTime')

		.string('guildId', { unique: true })
		.relation('moderation', ModerationModuleMode, { fields: ['guildId'], references: ['id'], onDelete: "Cascade" })
});
