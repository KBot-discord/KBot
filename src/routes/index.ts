// Imports
import { ApplyOptions } from '@sapphire/decorators';
import {
    methods,
    Route,
} from '@sapphire/plugin-api';

// Types
import type {
    ApiRequest,
    ApiResponse,
    RouteOptions,
} from '@sapphire/plugin-api';


@ApplyOptions<RouteOptions>({ route: '' })
export class ApiRoute extends Route {
    public [methods.GET](_request: ApiRequest, response: ApiResponse) {
        response.status(200).text('OK');
    }

    public [methods.POST](_request: ApiRequest, response: ApiResponse) {
        response.status(200).text('OK');
    }
}
