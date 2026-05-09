const {
    REST,
    Routes
} = require("discord.js");

const config = require("../config");
const command = require("../commands/createMusicChannel");

module.exports = (client) => {

    client.once("ready", async () => {

        console.log(`${client.user.tag} 로그인 완료`);

        const rest = new REST({ version: "10" })
            .setToken(config.token);

        await rest.put(
            Routes.applicationCommands(config.clientId),
            {
                body: [command.data.toJSON()]
            }
        );

        console.log("슬래시 명령어 등록 완료");
    });
};