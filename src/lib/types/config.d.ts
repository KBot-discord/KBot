interface IdHints {
	[key: string]: {
		[key: string]: string[];
	};
}

export interface Config {
	isDev: boolean;
	discord: {
		token: string;
		id: string;
		secret: string;
		idHints: { [key: string]: string[] };
		devServers: string[];
	};
	api: {
		port: number;
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
