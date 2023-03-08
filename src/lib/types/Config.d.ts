export interface ClientConfig {
	isDev: boolean;
	discord: {
		token: string;
		id: string;
		secret: string;
		devServers: Array<string>;
	};
	web: {
		url: string;
	};
	api: {
		host: string;
		port: number;
		auth: {
			cookie: string;
			domain: string;
		};
	};
	rpc: {
		server: {
			port: number;
		};
	};
	db: {
		url: string;
		cacheExpiry: number;
	};
	redis: {
		host: string;
		port: number;
		password: string;
	};
	meili: {
		host: string;
		port: number;
		apiKey: string;
	};
	observability: {
		metrics: {
			port: number;
		};
	};
	sentry: {
		dsn: string;
	};
	deepl: {
		key: string;
	};
	twitch: {
		id: string;
		secret: string;
		bearer: string;
		callback: string;
	};
	youtube: {
		apiKey: string;
		pubsub: {
			secret: string;
		};
	};
	premium: {
		patreon: {
			clientId: string;
			clientSecret: string;
			accessToken: string;
			refreshToken: string;
		};
	};
}
