import { createMixin } from 'schemix';

export default createMixin((model) => {
	model //
		.string('id', { default: { uuid: true }, raw: '@database.Uuid' });
});
