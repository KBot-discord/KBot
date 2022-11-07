// Imports
import { ApplyOptions } from '@sapphire/decorators';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({
	route: 'twitch/event'
})
export class TwitchEventRoute extends Route {
	public [methods.POST](_request: ApiRequest, response: ApiResponse) {
		// TODO handle webhook requests from twitch
	}
}
