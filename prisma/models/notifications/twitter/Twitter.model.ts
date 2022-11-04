import { createModel } from 'schemix';
import NotificationModuleModel from '../NotificationModule.model';
import TwitterFollowModel from './TwitterFollow.model';


export default createModel('Twitter', (TwitterModel) => {
    TwitterModel
        .string('id', { unique: true })

        .relation('follows', TwitterFollowModel, { list: true })
        .string('guildId', { unique: true })
        .relation('notifications', NotificationModuleModel, { fields: ['guildId'], references: ['id'] })

        .id({ fields: ['id', 'guildId'] });
});
