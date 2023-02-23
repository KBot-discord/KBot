export interface ClientConfig {
	isDev: boolean;
	discord: {
		token: string;
		id: string;
		secret: string;
		devServers: string[];
	};
	api: {
		port: number;
	};
	rpc: {
		server: {
			port: number;
		};
		youtube: {
			host: string;
			port: number;
		};
		twitter: {
			host: string;
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
}
