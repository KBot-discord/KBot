export type Key = string & { _: never };

export type RedisClientOptions = {
	host: string;
	port: number;
	password: string;
};
