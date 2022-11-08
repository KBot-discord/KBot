import { createModel } from 'schemix';
import ModerationModuleMode from './ModerationModule.mode';
import UUIDMixin from '../../mixins/UUID.mixin';

export default createModel('Mute', (MuteModel) => {
	// prettier-ignore
	MuteModel
		.mixin(UUIDMixin)
		.string('userId')
		.bigInt('time')
		.bigInt('evadeTime')

		.string('guildId', { unique: true })
		.relation('moderation', ModerationModuleMode, { fields: ['guildId'], references: ['id'] })

		.id({ fields: ['userId', 'guildId'] });
});
