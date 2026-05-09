const {
    Client,
    GatewayIntentBits,
    Collection,
    Partials
} = require("discord.js");

const { LavalinkManager } = require("lavalink-client");
const config = require("./config");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel]
});

client.commands = new Collection();
client.musicPanels = new Map();

client.lavalink = new LavalinkManager({
    nodes: [
        {
            authorization: config.lavalink.password,
            host: config.lavalink.host,
            port: Number(config.lavalink.port),
            id: "main-node"
        }
    ],

    sendToShard: async (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    },

    client: {
        id: config.clientId,
        username: "MusicBot"
    }
});

require("./events/ready")(client);
require("./events/messageCreate")(client);
require("./events/interactionCreate")(client);

client.login(config.token);