export function sendToHome() {
	return new Response(undefined, {
		status: 302,
		headers: {
			location: '/'
		}
	});
}

export function sendToOAuthError() {
	return new Response(undefined, {
		status: 302,
		headers: {
			location: '/oauth/error'
		}
	});
}
