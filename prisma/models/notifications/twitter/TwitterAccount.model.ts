import { createModel } from 'schemix';
import TwitterFollowModel from './TwitterFollow.model';


export default createModel((TwitterAccountModel) => {
    TwitterAccountModel
        .string('id')
        .string('name')
        .string('image')

        .relation('follows', TwitterFollowModel, { list: true })

        .id({ fields: ['id'] });
});
