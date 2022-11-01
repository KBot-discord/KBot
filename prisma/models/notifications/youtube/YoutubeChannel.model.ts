import { createModel } from 'schemix';
import SubscriptionModel from './Subscription.model';


export default createModel((YoutubeChannelModel) => {
    YoutubeChannelModel
        .string('id')
        .string('name')
        .string('image')

        .relation('subscriptions', SubscriptionModel, { list: true })

        .id({ fields: ['id'] });
});
