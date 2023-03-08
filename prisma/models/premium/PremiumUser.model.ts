import PremiumClaimModel from './PremiumClaim.model';
import { createModel } from 'schemix';

export default createModel('PremiumUser', (model) => {
	model
		.string('id', { id: true, unique: true })
		.int('totalClaims')

		.relation('premiumClaims', PremiumClaimModel, { list: true });
});
