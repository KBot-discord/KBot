import ModerationModuleMode from './ModerationModule.model';
import { createModel } from 'schemix';

export default createModel('LockedChannel', (model) => {
	// prettier-ignore
	model
		.string('id', { id: true, unique: true }) // Channel ID
		.bigInt('time')

		.string('guildId', { unique: true })
		.relation('moderation', ModerationModuleMode, { fields: ['guildId'], references: ['id'], onDelete: "Cascade" })
});
