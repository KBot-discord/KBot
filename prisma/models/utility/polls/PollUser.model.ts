import { createModel } from 'schemix';
import PollModel from './Poll.model';

export default createModel('PollUser', (model) => {
	// prettier-ignore
	model
		.string('id', { unique: true }) // User id
		.int('option')

		.string('pollId', { unique: true })
		.relation('poll', PollModel, { fields: ['pollId'], references: ['id'], onDelete: "Cascade" })

		.id({ fields: ['id', 'pollId']})
});
