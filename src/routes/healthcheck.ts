import { ApplyOptions } from '@sapphire/decorators';
import {
    ApiRequest, ApiResponse, methods, Route, RouteOptions,
} from '@sapphire/plugin-api';


@ApplyOptions<RouteOptions>({ route: '/healthcheck' })
export class HeartbeatRoute extends Route {
    public [methods.GET](_request: ApiRequest, response: ApiResponse) {
        response.status(200).text('OK');
    }
}
