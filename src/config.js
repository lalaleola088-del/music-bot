require("dotenv").config();

module.exports = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,

    lavalink: {
        host: process.env.LAVALINK_HOST,
        port: process.env.LAVALINK_PORT,
        password: process.env.LAVALINK_PASSWORD
    }
};