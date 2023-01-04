import GuildModel from '../Guild.model';
import { createModel } from 'schemix';

export default createModel('WelcomeModule', (model) => {
	// prettier-ignore
	model
		.string('id', { id: true, unique: true }) // Guild ID
		.boolean('moduleEnabled', { default: true })
		.boolean('messagesEnabled', { optional: true })
		.string('channel', { unique: true, optional: true })
		.string('message', { optional: true })
		.string('title', { optional: true })
		.string('description', { optional: true })
		.string('image', { optional: true })
		.string('color', { optional: true })

		.relation('guild', GuildModel, { fields: ['id'], references: ['id'], onDelete: "Cascade" })
});
