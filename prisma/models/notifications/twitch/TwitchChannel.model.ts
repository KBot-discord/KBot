import { createModel } from 'schemix';
import TwitchFollowModel from './TwitchFollow.model';


export default createModel('TwitchChannel', (TwitchChannelModel) => {
    TwitchChannelModel
        .string('id', { unique: true })
        .string('name')
        .string('image')

        .relation('follows', TwitchFollowModel, { list: true })

        .id({ fields: ['id'] });
});
