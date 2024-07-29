import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { Route, methods } from '@sapphire/plugin-api';
import type { ApiRequest, ApiResponse, MimeTypes } from '@sapphire/plugin-api';
import { register } from 'prom-client';

@ApplyOptions<Route.Options>({
	route: 'metrics',
})
export class ApiRoute extends Route {
	public async [methods.GET](_request: ApiRequest, response: ApiResponse): Promise<void> {
		try {
			response
				.setContentType(register.contentType as MimeTypes)
				.status(200)
				.respond(await register.metrics());
		} catch (error: unknown) {
			container.logger.sentryError(error);
			response
				.status(500) //
				.respond({ error: 'An error occurred while collecting metrics' });
		}
	}
}
