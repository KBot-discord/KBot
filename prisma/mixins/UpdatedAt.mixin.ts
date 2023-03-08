import { createMixin } from 'schemix';

export default createMixin((UpdatedAtMixin) => {
	// prettier-ignore
	UpdatedAtMixin
		.dateTime('updatedAt', { updatedAt: true });
});
