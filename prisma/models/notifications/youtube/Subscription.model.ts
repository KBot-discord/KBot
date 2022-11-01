import { createModel } from 'schemix';
import YoutubeChannelModel from './YoutubeChannel.model';
import YoutubeModel from './Youtube.model';


export default createModel((SubscriptionModel) => {
    SubscriptionModel
        .string('id')
        .string('message')
        .string('webhookId')
        .string('webhookToken')

        .relation('channel', YoutubeChannelModel, { fields: ['channelId'], references: ['id'] })
        .string('channelId', { unique: true })
        .relation('youtube', YoutubeModel, { fields: ['youtubeId'], references: ['id'] })
        .string('youtubeId', { unique: true })

        .id({ fields: ['id', 'channelId', 'youtubeId'] });
});
