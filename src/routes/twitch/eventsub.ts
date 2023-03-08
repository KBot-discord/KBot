import { ApplyOptions } from '@sapphire/decorators';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { isNullish, isObject } from '@sapphire/utilities';
import { container } from '@sapphire/framework';
import { createHmac, timingSafeEqual } from 'crypto';
import type { EventSubData, EventSubOnlineData } from '#types/Twitch';

@ApplyOptions<Route.Options>({
	route: 'twitch/eventsub'
})
export class ApiRoute extends Route {
	private previousMessageIds: Set<string> = new Set<string>();

	public async [methods.POST](req: ApiRequest, res: ApiResponse) {
		const { secret } = this.container.config.twitch;
		const messageId = req.headers['twitch-eventsub-message-id'] as string | undefined;
		const messageSignature = req.headers['twitch-eventsub-message-signature'] as string | undefined;
		const messageTimestamp = req.headers['twitch-eventsub-message-timestamp'] as string | undefined;
		const messageType = req.headers['twitch-eventsub-message-type'] as
			| 'notification'
			| 'revocation'
			| 'webhook_callback_verification'
			| undefined;

		this.container.logger.debug(req.headers);
		this.container.logger.debug(req.body);

		if (isNullish(messageId) || isNullish(messageSignature) || isNullish(messageTimestamp) || !isObject(req.body)) {
			return res.badRequest();
		}

		if (this.previousMessageIds.has(messageId)) {
			return res.ok();
		}

		try {
			const hmacMessage = messageId + messageTimestamp + JSON.stringify(req.body);

			const hmac = createHmac('sha256', secret).update(hmacMessage).digest('hex');

			if (!timingSafeEqual(Buffer.from(hmac), Buffer.from(messageSignature))) {
				return res.forbidden();
			}
		} catch (err: unknown) {
			this.container.logger.debug(err);
			return res.badRequest();
		}

		const notification = req.body as EventSubData;

		if (messageType === 'webhook_callback_verification') {
			return res.text(notification.challenge);
		}

		if (notification.subscription.type === 'stream.online') {
			await container.twitch.postStream(notification.event as EventSubOnlineData);
		}

		this.previousMessageIds.add(messageId);
	}
}
