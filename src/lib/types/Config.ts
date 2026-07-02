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
	api: {
		host: string;
		port: number;
	};
};
