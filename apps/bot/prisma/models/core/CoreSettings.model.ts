import EventSettingsModel from '../events/EventSettings.model';
import ModerationSettingsModel from '../moderation/ModerationSettings.model';
import TwitchSettingsModel from '../twitch/TwitchSettings.model';
import UtilitySettingsModel from '../utility/UtilitySettings.model';
import WelcomeSettingsModel from '../welcome/WelcomeSettings.model';
import YoutubeSettingsModel from '../youtube/YoutubeSettings.model';
import FeatureFlagsEnum from '../../enums/FeatureFlags.enum';
import { createModel } from 'schemix';

export default createModel('CoreSettings', (model) => {
	model
		.string('guildId', { id: true, unique: true })
		.enum('flags', FeatureFlagsEnum, { list: true })

		.relation('eventSettings', EventSettingsModel, { optional: true })
		.relation('moderationSettings', ModerationSettingsModel, { optional: true })
		.relation('twitchSettings', TwitchSettingsModel, { optional: true })
		.relation('utilitySettings', UtilitySettingsModel, { optional: true })
		.relation('welcomeSettings', WelcomeSettingsModel, { optional: true })
		.relation('youtubeSettings', YoutubeSettingsModel, { optional: true });
});
