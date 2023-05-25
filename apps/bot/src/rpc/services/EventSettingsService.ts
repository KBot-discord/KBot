import { authenticated, catchServerError } from '#rpc/middlewares';
import { assertManagePermissions } from '#rpc/utils';
import {
	GetEventSettingsResponse,
	UpdateEventSettingsResponse,
	EventSettingsService,
	GetEventSettingsRequest,
	UpdateEventSettingsRequest,
	fromRequired
} from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import * as connect from '@bufbuild/connect';
import type { ConnectRouter, ServiceImpl } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';

export function registerEventSettingsService(router: ConnectRouter): void {
	router.service(EventSettingsService, new EventSettingsServiceImpl());
}

class EventSettingsServiceImpl implements ServiceImpl<typeof EventSettingsService> {
	@authenticated()
	@catchServerError()
	public async getEventSettings({ guildId }: GetEventSettingsRequest, { auth }: connect.HandlerContext): Promise<GetEventSettingsResponse> {
		const { events } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const settings = await events.settings.get(guild.id);

			const data: PartialMessage<GetEventSettingsResponse> = { settings: settings ?? undefined };

			return new GetEventSettingsResponse(data);
		});
	}

	@authenticated()
	@catchServerError()
	public async updateEventSettings(
		{ guildId, enabled }: UpdateEventSettingsRequest,
		{ auth }: connect.HandlerContext
	): Promise<UpdateEventSettingsResponse> {
		const { events } = container;

		return assertManagePermissions(guildId, auth, async ({ guild }) => {
			const enabledValue = fromRequired(enabled);

			const settings = await events.settings.upsert(guild.id, {
				enabled: enabledValue
			});

			const data: PartialMessage<UpdateEventSettingsResponse> = { settings };

			return new UpdateEventSettingsResponse(data);
		});
	}
}
