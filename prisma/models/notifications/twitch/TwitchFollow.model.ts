import { createModel } from 'schemix';
import TwitchChannelModel from './TwitchChannel.model';
import TwitchModel from './Twitch.model';


export default createModel((TwitchFollowModel) => {
    TwitchFollowModel
        .string('id')
        .string('message')
        .string('webhookId')
        .string('webhookToken')

        .relation('channel', TwitchChannelModel, { fields: ['channelId'], references: ['id'] })
        .string('channelId', { unique: true })
        .relation('twitch', TwitchModel, { fields: ['twitchId'], references: ['id'] })
        .string('twitchId', { unique: true })

        .id({ fields: ['id', 'twitchId', 'channelId'] });
});
