import { createModel } from 'schemix';
import SubscriptionModel from './Subscription.model';


export default createModel('YoutubeChannel', (YoutubeChannelModel) => {
    YoutubeChannelModel
        .string('id', { unique: true })
        .string('name')
        .string('image')

        .relation('subscriptions', SubscriptionModel, { list: true })

        .id({ fields: ['id'] });
});
