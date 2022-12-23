import { TwirpError } from 'twirpscript';

export const RpcError = {
	BadRequest: (msg: string) => new TwirpError({ code: 'malformed', msg }),
	NotFound: (msg: string) => new TwirpError({ code: 'not_found', msg })
};
