export interface Config {
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
			url: string;
			port: number;
		};
	};
	db: {
		url: string;
	};
	redis: {
		host: string;
		port: number;
		password: string;
	};
	metrics: {
		port: number;
	};
	sentry: {
		dsn: string;
	};
}
