import PollModel from './Poll.model';
import { createModel } from 'schemix';

export default createModel('PollUser', (model) => {
	model
		.string('id', { unique: true }) // User id
		.int('option')

		.string('pollId', { unique: true })
		.relation('poll', PollModel, { fields: ['pollId'], references: ['id'], onDelete: 'Cascade' })

		.id({ fields: ['id', 'pollId'] });
});
