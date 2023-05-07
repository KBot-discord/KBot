import { ApplyOptions } from '@sapphire/decorators';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import * as promClient from 'prom-client';
import { container } from '@sapphire/framework';
import type { MimeTypes } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({
	route: 'metrics'
})
export class ApiRoute extends Route {
	public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
		try {
			response.setContentType(promClient.register.contentType as MimeTypes);
			response.end(await promClient.register.metrics());
		} catch (err: unknown) {
			container.logger.error(err);
			response.status(500).end();
		}
	}
}
