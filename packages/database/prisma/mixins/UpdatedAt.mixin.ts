import { createMixin } from 'schemix';

export default createMixin((model) => {
	model //
		.dateTime('updatedAt', { updatedAt: true });
});
