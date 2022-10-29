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
    idHints: IdHints,
}

interface IdHints {
    uwu: string,
    ping: string,
    userinfo: string,
    echo: string,
    addemote: string,
}
