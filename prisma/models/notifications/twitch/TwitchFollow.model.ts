import { createModel } from 'schemix';
import TwitchChannelModel from './TwitchChannel.model';
import TwitchModel from './Twitch.model';


export default createModel('TwitchFollow', (TwitchFollowModel) => {
    TwitchFollowModel
        .string('id')
        .string('message')
        .string('webhookId')
        .string('webhookToken')

        .string('channelId', { unique: true })
        .relation('channel', TwitchChannelModel, { fields: ['channelId'], references: ['id'] })
        .string('guildId', { unique: true })
        .relation('twitch', TwitchModel, { fields: ['guildId'], references: ['id'] })

        .id({ fields: ['id', 'channelId', 'guildId'] });
});
