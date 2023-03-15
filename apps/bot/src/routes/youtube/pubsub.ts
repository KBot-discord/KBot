import { ApplyOptions } from '@sapphire/decorators';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { createHmac } from 'crypto';

@ApplyOptions<Route.Options>({
	route: 'youtube/pubsub'
})
export class ApiRoute extends Route {
	public async [methods.GET](req: ApiRequest, res: ApiResponse) {
		const topic = req.params['hub.topic'] as string | undefined;
		const mode = req.params['hub.mode'] as string | undefined;
		const challenge = req.params['hub.challenge'] as string | undefined;

		if (!topic || !mode) {
			return res.badRequest();
		}

		switch (mode) {
			case 'unsubscribe':
			case 'subscribe':
				break;
			case 'denied':
				return res.error(500);
			default:
				return res.badRequest();
		}

		if (challenge) {
			return res.ok();
		}
		return res.badRequest();
	}

	public async [methods.POST](req: ApiRequest, res: ApiResponse) {
		const signature = (req.headers['x-hub-signature'] ?? req.headers['X-Hub-Signature']) as string | undefined;

		if (!signature) {
			return res.forbidden();
		}

		const result = this.parseRequest(req, signature);
		if (!result || !result.verified) {
			return res.forbidden();
		}

		await this.container.youtube.videos.handleNewVideo(result.data);
		return res.status(204);
	}

	private parseRequest(req: ApiRequest, signature: string) {
		const { config, youtube } = this.container;

		const body = req.body as any;

		try {
			const method = signature.split('=')[0];
			const hmac = createHmac(method, config.youtube.pubsub.secret);

			hmac.update(body);

			const parsedData = youtube.convertXmlToJson(body);
			const videos = youtube.formatVideosFromJson(parsedData);

			return {
				verified: signature === `${method}=${hmac.digest('hex')}`,
				data: videos[0]
			};
		} catch {
			return null;
		}
	}
}
