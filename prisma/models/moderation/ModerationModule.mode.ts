import { createModel } from 'schemix';
import MuteModel from './Mute.model';
import LockedChannelModel from './LockedChannel.model';

export default createModel('ModerationModule', (ModerationModuleModel) => {
	// prettier-ignore
	ModerationModuleModel
		.string('id', { id: true, unique: true }) // Guild ID
		.boolean('moduleEnabled')
		.string('logChannel')
		.string('reportChannel')
		.int('minAccountAgeReq')
		.string('minAccountAgeMsg')

		.relation('mutes', MuteModel, { list: true })
		.relation('lockedChannels', LockedChannelModel, { list: true });
});
