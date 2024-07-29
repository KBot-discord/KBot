import { ApplyOptions } from '@sapphire/decorators';
import { Route, methods } from '@sapphire/plugin-api';
import type { ApiRequest, ApiResponse } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({
	route: 'heartbeat',
})
export class ApiRoute extends Route {
	public [methods.GET](_request: ApiRequest, response: ApiResponse): void {
		response.ok();
	}
}
