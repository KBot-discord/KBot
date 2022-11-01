import { createModel } from 'schemix';
import ModerationModuleMode from './ModerationModule.mode';


export default createModel((MuteModel) => {
    MuteModel
        .string('id')
        .string('userId')
        .dateTime('time')
        .dateTime('evadeTime')

        .relation('moderation', ModerationModuleMode, { fields: ['moderationId'], references: ['id'] })
        .string('moderationId', { unique: true })

        .id({ fields: ['id', 'moderationId'] });
});
