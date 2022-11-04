import { createModel } from 'schemix';
import NotificationModule from '../NotificationModule.model';
import TwitchFollowModel from './TwitchFollow.model';


export default createModel('Twitch', (TwitchModel) => {
    TwitchModel
        .string('id', { unique: true })

        .relation('follows', TwitchFollowModel, { list: true })
        .string('guildId', { unique: true })
        .relation('notifications', NotificationModule, { fields: ['guildId'], references: ['id'] })

        .id({ fields: ['id', 'guildId'] });
});
