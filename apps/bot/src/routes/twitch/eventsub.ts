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
	private previousMessageId: string | null = null;

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

		this.container.logger.debug(messageType);

		if (isNullish(messageId) || isNullish(messageSignature) || isNullish(messageTimestamp) || !isObject(req.body)) {
			return res.badRequest();
		}

		if (this.previousMessageId === messageId) {
			return res.badRequest();
		}

		if (messageType === 'revocation') {
			const data = req.body as { subscription: { status: string } };
			this.container.logger.warn(`Subscription revoked.\nReason: ${data.subscription.status}}`);
			return res.ok();
		}

		try {
			const hmacMessage = messageId + messageTimestamp + JSON.stringify(req.body);
			const hmac = createHmac('sha256', secret).update(hmacMessage).digest('hex');
			const parsedSignature = messageSignature.split('=')[1];

			if (!timingSafeEqual(Buffer.from(hmac), Buffer.from(parsedSignature))) {
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

		this.previousMessageId = messageId;

		return res.ok();
	}
}
