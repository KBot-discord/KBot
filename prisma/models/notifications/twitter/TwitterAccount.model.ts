import { createModel } from 'schemix';
import TwitterFollowModel from './TwitterFollow.model';

export default createModel('TwitterAccount', (model) => {
	// prettier-ignore
	model
		.string('id', { id: true, unique: true })
		.string('name')
		.string('image')

		.relation('follows', TwitterFollowModel, { list: true });
});
