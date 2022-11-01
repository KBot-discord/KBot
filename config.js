process.env.NODE_ENV ??= 'dev';

const commandIds = require('./commandIds')


const config = {
    isDev: process.env.NODE_ENV !== 'production',
    discord: {
        token: process.env.DISCORD_TOKEN,
        id: process.env.CLIENT_ID,
        secret: process.env.CLIENT_SECRET,
        idHints: commandIds[process.env.NODE_ENV],
        devServers: [
            '953375922990506005',
        ],
    },
    api: {
        port: process.env.API_PORT
    },
    db: {
        url: process.env.DATABASE_URL,
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASS,
    },
    metrics: {
        port: process.env.METRICS_PORT
    },
    sentry: {
        dsn: process.env.SENTRY_DSN,
    },
}

module.exports = config;
