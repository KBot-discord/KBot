import { createModel } from 'schemix';
import UtilityModuleModel from './UtilityModule.model';
import PollUserModel from './PollUser.model';


export default createModel('Poll', (PollModel) => {
    PollModel
        .string('id', { unique: true }) // Message id
        .string('channel')
        .bigInt('time')

        .relation('users', PollUserModel, { list: true })
        .string('guildId', { unique: true })
        .relation('utility', UtilityModuleModel, { fields: ['guildId'], references: ['id'] })

        .id({ fields: ['id', 'guildId'] });
});
