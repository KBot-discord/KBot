import { createMixin } from 'schemix';

export default createMixin((UUIDMixin) => {
	UUIDMixin.string('id', { default: { uuid: true }, raw: '@database.Uuid' });
});
