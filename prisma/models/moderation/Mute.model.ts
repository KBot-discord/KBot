import { createModel } from 'schemix';
import ModerationModuleMode from './ModerationModule.mode';


export default createModel('Mute', (MuteModel) => {
    MuteModel
        .string('id', { unique: true })
        .string('userId')
        .bigInt('time')
        .bigInt('evadeTime')

        .string('guildId', { unique: true })
        .relation('moderation', ModerationModuleMode, { fields: ['guildId'], references: ['id'] })

        .id({ fields: ['id', 'guildId'] });
});
