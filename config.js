const config = {
    discord: {
        token: process.env.DISCORD_TOKEN,
        id: process.env.CLIENT_ID,
        secret: process.env.CLIENT_SECRET,
    },
    api: {
        port: 8500
    }
}

export default config;
