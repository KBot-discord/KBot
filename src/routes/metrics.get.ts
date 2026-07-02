import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import type { MimeType } from '@sapphire/plugin-api';
import { Route } from '@sapphire/plugin-api';
import { register } from 'prom-client';

@ApplyOptions<Route.Options>({
	route: 'metrics',
})
export class ApiRoute extends Route {
	public override async run(_request: Route.Request, response: Route.Response): Promise<void> {
		try {
			const metrics = await register.metrics();

			response
				.setContentType(register.contentType as MimeType)
				.status(200)
				.respond(metrics);
		} catch (error) {
			container.logger.error(error);

			response
				.status(500) //
				.respond({ error: 'An error occurred while collecting metrics' });
		}
	}
}
