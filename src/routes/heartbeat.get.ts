import { ApplyOptions } from '@sapphire/decorators';
import { Route } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({
	route: 'heartbeat',
})
export class ApiRoute extends Route {
	public override run(_request: Route.Request, response: Route.Response): void {
		response.ok();
	}
}
