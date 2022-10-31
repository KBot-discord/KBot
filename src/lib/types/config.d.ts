export interface Config {
    isDev: boolean;
    discord: {
        token: string;
        id: string;
        secret: string;
        idHints: IdHints;
        devServers: string[];
    },
    api: {
        port: number;
    },
    db: {
        url: string;
    },
    redis: {
        host: string,
        port: number,
        password: string,
    },
    metrics: {
        port: number;
    },
    sentry: {
        enable: boolean;
        dsn: string;
    },
}

interface IdHints {
    uwu: string[],
    ping: string[],
    userinfo: string[],
    echo: string[],
    addemote: string[],
}
