export type ClientConfig = {
	env: string;
	isDev: boolean;
	discord: {
		token: string;
		id: string;
		secret: string;
		devServers: string[];
		ownerIds: string[];
	};
	db: {
		url: string;
	};
	redis: {
		host: string;
		port: number;
		password: string;
	};
};
