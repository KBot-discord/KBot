import { createModel } from 'schemix';
import GuildModel from '../Guild.model';
import TwitterModel from './twitter/Twitter.model';
import TwitchModel from './twitch/Twitch.model';
import YoutubeModel from './youtube/Youtube.model';


export default createModel((NotificationModuleModel) => {
    NotificationModuleModel
        .string('id', { unique: true })
        .boolean('moduleEnabled')

        .relation('twitter', TwitterModel, { optional: true })
        .relation('youtube', YoutubeModel, { optional: true })
        .relation('twitch', TwitchModel, { optional: true })
        .relation('guild', GuildModel, { fields: ['guildId'], references: ['id'] })
        .string('guildId', { unique: true })

        .id({ fields: ['id', 'guildId'] });
});
