import { createModel } from 'schemix';
import SubscriptionModel from './Subscription.model';
import NotificationModuleModel from '../NotificationModule.model';


export default createModel('Youtube', (YoutubeModel) => {
    YoutubeModel
        .string('id', { unique: true })

        .relation('subscriptions', SubscriptionModel, { list: true })
        .string('guildId', { unique: true })
        .relation('notifications', NotificationModuleModel, { fields: ['guildId'], references: ['id'] })

        .id({ fields: ['id', 'guildId'] });
});
