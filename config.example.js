const config = {
    isDev: true,
    discord: {
        token: '',
        id: '',
        secret: '',
        idHints: {
            // Command IDs
        },
        devServers: [],
    },
    api: {
        port: 3000,
    },
    db: {
        url: '',
    },
    redis: {
        host: '',
        port: '',
        password: '',
    },
    metrics: {
        port: 3001,
    },
    sentry: {
        dsn: '',
    },
};

module.exports = config;
