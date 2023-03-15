import TwitchAccountModel from './TwitchAccount.model';
import TwitchSettingsModel from './TwitchSettings.model';
import UUIDMixin from '../../mixins/UUID.mixin';
import { createModel } from 'schemix';

export default createModel('TwitchSubscription', (model) => {
	model
		.mixin(UUIDMixin)
		.string('message', { optional: true })
		.string('roleId', { optional: true })
		.string('discordChannelId', { optional: true })

		.string('accountId')
		.relation('account', TwitchAccountModel, { fields: ['accountId'], references: ['id'], onDelete: 'Cascade' })
		.string('guildId', { unique: true })
		.relation('twitchSettings', TwitchSettingsModel, { fields: ['guildId'], references: ['guildId'], onDelete: 'Cascade' })

		.id({ fields: ['id'] })
		.unique({ fields: ['guildId', 'accountId'] });
});
