import { createModel } from 'schemix';
import PollModel from './Poll.model';

export default createModel('PollUser', (PollUserModel) => {
	// prettier-ignore
	PollUserModel
		.string('id', { unique: true }) // User id
		.int('option')

		.string('pollId', { unique: true })
		.relation('poll', PollModel, { fields: ['pollId'], references: ['id'] })

		.id({ fields: ['id', 'pollId'] });
});
