import { ApplyOptions } from '@sapphire/decorators';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({ route: '' })
export class ApiRoute extends Route {
	public [methods.GET](_request: ApiRequest, response: ApiResponse) {
		response.status(200).text('OK');
	}

	public [methods.POST](_request: ApiRequest, response: ApiResponse) {
		response.status(200).text('OK');
	}
}
