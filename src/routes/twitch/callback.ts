import { ApplyOptions } from '@sapphire/decorators';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { isNullish, isObject } from '@sapphire/utilities';
import { container } from '@sapphire/framework';
import { createHmac, timingSafeEqual } from 'crypto';
import type { EventSubData, EventSubOnlineData } from '#types/Twitch';

@ApplyOptions<Route.Options>({
	route: 'twitch/callback'
})
export class ApiRoute extends Route {
	private previousMessageIds: Set<string> = new Set<string>();

	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		const { secret } = this.container.config.twitch;
		const messageId = request.headers['twitch-eventsub-message-id'] as string | undefined;
		const messageSignature = request.headers['twitch-eventsub-message-signature'] as string | undefined;
		const messageTimestamp = request.headers['twitch-eventsub-message-timestamp'] as string | undefined;
		const messageType = request.headers['twitch-eventsub-message-type'] as
			| 'notification'
			| 'revocation'
			| 'webhook_callback_verification'
			| undefined;

		this.container.logger.debug(request.headers);
		this.container.logger.debug(request.body);

		if (isNullish(messageId) || isNullish(messageSignature) || isNullish(messageTimestamp) || !isObject(request.body)) {
			return response.badRequest();
		}

		if (this.previousMessageIds.has(messageId)) {
			return response.ok();
		}

		try {
			const hmacMessage = messageId + messageTimestamp + JSON.stringify(request.body);

			const hmac = createHmac('sha256', secret).update(hmacMessage).digest('hex');

			if (!timingSafeEqual(Buffer.from(hmac), Buffer.from(messageSignature))) {
				return response.forbidden();
			}
		} catch (err: unknown) {
			this.container.logger.debug(err);
			return response.badRequest();
		}

		const notification = request.body as EventSubData;

		if (messageType === 'webhook_callback_verification') {
			return response.text(notification.challenge);
		}

		if (notification.subscription.type === 'stream.online') {
			await container.notifications.twitch.postStream(notification.event as EventSubOnlineData);
		}

		this.previousMessageIds.add(messageId);
	}
}
