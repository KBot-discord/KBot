import { createModel } from 'schemix';


export default createModel('TwitchStream', (TwitchStreamModel) => {
    TwitchStreamModel
        .string('id', { unique: true })
        .string('title')
        .string('messageIds', { list: true })

        .id({ fields: ['id'] });
});
