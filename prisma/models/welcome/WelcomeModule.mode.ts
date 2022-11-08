import { createModel } from 'schemix';

export default createModel('WelcomeModule', (WelcomeModuleModel) => {
	// prettier-ignore
	WelcomeModuleModel
		.string('id', { id: true, unique: true }) // Guild ID
		.boolean('moduleEnabled')
		.boolean('messagesEnabled')
		.string('channel')
		.string('message')
		.string('title')
		.string('description')
		.string('image')
		.string('color');
});
