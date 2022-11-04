import { createModel } from 'schemix';
import YoutubeChannelModel from './YoutubeChannel.model';
import YoutubeModel from './Youtube.model';


export default createModel('YoutubeSubscription', (SubscriptionModel) => {
    SubscriptionModel
        .string('id')
        .string('message')
        .string('webhookId')
        .string('webhookToken')

        .string('channelId', { unique: true })
        .relation('channel', YoutubeChannelModel, { fields: ['channelId'], references: ['id'] })
        .string('guildId', { unique: true })
        .relation('youtube', YoutubeModel, { fields: ['guildId'], references: ['id'] })

        .id({ fields: ['id', 'channelId', 'guildId'] });
});
