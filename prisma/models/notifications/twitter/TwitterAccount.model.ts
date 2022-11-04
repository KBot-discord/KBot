import { createModel } from 'schemix';
import TwitterFollowModel from './TwitterFollow.model';


export default createModel('TwitterAccount', (TwitterAccountModel) => {
    TwitterAccountModel
        .string('id', { unique: true })
        .string('name')
        .string('image')

        .relation('follows', TwitterFollowModel, { list: true })

        .id({ fields: ['id'] });
});
