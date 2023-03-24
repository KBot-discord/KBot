import { ApplyOptions } from '@sapphire/decorators';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({
	route: 'heartbeat'
})
export class ApiRoute extends Route {
	public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
		return response.ok();
	}
}
