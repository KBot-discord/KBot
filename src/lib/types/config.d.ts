export interface Config {
    discord: {
        token: string;
        id: string;
        secret: string;
    },
    api: {
        port: number;
    },
    metrics: {
        port: number;
    },
}
