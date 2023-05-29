import { authenticated, catchServerError } from '#grpc/middlewares';
import { assertManagePermissions } from '#grpc/utils';
import { gRPCService } from '#plugins/grpc';
import {
	EventSettingsService,
	GetEventSettingsRequest,
	GetEventSettingsResponse,
	UpdateEventSettingsRequest,
	UpdateEventSettingsResponse,
	fromRequired
} from '@kbotdev/proto';
import { container } from '@sapphire/framework';
import * as connect from '@bufbuild/connect';
import type { ConnectRouter, ServiceImpl } from '@bufbuild/connect';
import type { PartialMessage } from '@bufbuild/protobuf';

export class EventSettingsServiceImpl extends gRPCService implements ServiceImpl<typeof EventSettingsService> {
	public register(router: ConnectRouter): void {
		router.service(EventSettingsService, this);
	}

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
