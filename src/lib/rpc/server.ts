import { getCoreSettingsHandlers } from '#lib/rpc/services/core/GuildSettingsService';
import { getDiscordChannelHandlers } from '#lib/rpc/services/discord/ChannelService';
import { getDiscordGuildHandlers } from '#lib/rpc/services/discord/GuildService';
import { getDiscordRoleHandlers } from '#lib/rpc/services/discord/RoleService';
import { getDiscordUserHandlers } from '#lib/rpc/services/discord/UserService';
import { getModerationCasesHandlers } from '#lib/rpc/services/moderation/CasesService';
import { getModerationSettingsHandlers } from '#lib/rpc/services/moderation/ModerationSettingsService';
import { getEventSettingsHandlers } from '#lib/rpc/services/events/EventsSettingsService';
import { getNotificationSettingsHandlers } from '#lib/rpc/services/notifications/NotificationSettingsService';
import { getUtilitySettingsHandlers } from '#lib/rpc/services/utility/UtilitySettingsService';
import { getWelcomeSettingsHandlers } from '#lib/rpc/services/welcome/WelcomeSettingsService';
import { container } from '@sapphire/framework';
import { mergeHandlers } from '@bufbuild/connect-node';
import * as http2 from 'http2';

const handlers = mergeHandlers([
	...getCoreSettingsHandlers(),
	...getDiscordChannelHandlers(),
	...getDiscordGuildHandlers(),
	...getDiscordRoleHandlers(),
	...getDiscordUserHandlers(),
	...getEventSettingsHandlers(),
	...getModerationCasesHandlers(),
	...getModerationSettingsHandlers(),
	...getNotificationSettingsHandlers(),
	...getUtilitySettingsHandlers(),
	...getWelcomeSettingsHandlers()
]);

http2.createServer(handlers).listen(container.config.rpc.server.port);
