import { ApplyOptions } from '@sapphire/decorators';
import { methods, Route } from '@sapphire/plugin-api';
import { register } from 'prom-client';
import { container } from '@sapphire/framework';
import type { ApiRequest, ApiResponse } from '@sapphire/plugin-api';
import type { MimeTypes } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({
	route: 'metrics'
})
export class ApiRoute extends Route {
	public async [methods.GET](_request: ApiRequest, response: ApiResponse): Promise<void> {
		try {
			response.setContentType(register.contentType as MimeTypes);
			response.end(await register.metrics());
		} catch (err: unknown) {
			container.logger.error(err);
			response.status(500).end();
		}
	}
}
