import { createModel } from 'schemix';
import TwitterFollowModel from './TwitterFollow.model';

export default createModel('TwitterAccount', (TwitterAccountModel) => {
	// prettier-ignore
	TwitterAccountModel
		.string('id', { id: true, unique: true })
		.string('name')
		.string('image')

		.relation('follows', TwitterFollowModel, { list: true });
});
