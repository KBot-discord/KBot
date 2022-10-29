const commandIds = require('./commandIds')

const config = {
    discord: {
        token: process.env.DISCORD_TOKEN,
        id: process.env.CLIENT_ID,
        secret: process.env.CLIENT_SECRET,
    },
    api: {
        port: process.env.API_PORT
    },
    metrics: {
        port: process.env.METRICS_PORT
    },
    idHints: commandIds[process.env.NODE_ENV],
}

module.exports = config;
