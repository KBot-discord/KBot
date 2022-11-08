import { createMixin } from 'schemix';

export default createMixin((UUIDMixin) => {
	// prettier-ignore
	UUIDMixin 
		.string('id', { default: { uuid: true }, raw: '@database.Uuid' });
});
