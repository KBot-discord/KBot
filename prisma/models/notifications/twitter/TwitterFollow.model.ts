import { createModel } from 'schemix';
import TwitterModel from './Twitter.model';
import TwitterAccountModel from './TwitterAccount.model';


export default createModel('TwitterFollow', (TwitterFollowModel) => {
    TwitterFollowModel
        .string('id')
        .string('message')
        .string('webhookId')
        .string('webhookToken')

        .string('accountId', { unique: true })
        .relation('account', TwitterAccountModel, { fields: ['accountId'], references: ['id'] })
        .string('guildId', { unique: true })
        .relation('twitter', TwitterModel, { fields: ['guildId'], references: ['id'] })

        .id({ fields: ['id', 'accountId', 'guildId'] });
});
