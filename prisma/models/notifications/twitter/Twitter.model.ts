import { createModel } from 'schemix';
import NotificationModuleModel from '../NotificationModule.model';
import TwitterFollowModel from './TwitterFollow.model';


export default createModel((TwitterModel) => {
    TwitterModel
        .string('id', { unique: true })

        .relation('follows', TwitterFollowModel, { list: true })
        .relation('notifications', NotificationModuleModel, { fields: ['notificationId'], references: ['id'] })
        .string('notificationId', { unique: true })

        .id({ fields: ['id', 'notificationId'] });
});
