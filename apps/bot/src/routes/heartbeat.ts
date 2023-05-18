import { ApplyOptions } from '@sapphire/decorators';
import { methods, Route } from '@sapphire/plugin-api';
import type { ApiRequest, ApiResponse } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({
	route: 'heartbeat'
})
export class ApiRoute extends Route {
	public async [methods.GET](_request: ApiRequest, response: ApiResponse): Promise<void> {
		response.ok();
	}
}
