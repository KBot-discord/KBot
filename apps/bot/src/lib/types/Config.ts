export interface ClientConfig {
	isDev: boolean;
	discord: {
		token: string;
		id: string;
		secret: string;
		devServers: Array<string>;
		ownerIds: Array<string>;
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
	holodex: {
		apiKey: string;
		twitchConflicts: Array<string>;
	};
	sentry: {
		dsn: string;
	};
}
