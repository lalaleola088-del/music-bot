const controls = require("../buttons/controls");
const command = require("../commands/createMusicChannel");

module.exports = (client) => {

    client.on("interactionCreate", async (interaction) => {

        if (interaction.isButton()) {
            return controls(interaction, client);
        }

        if (interaction.isChatInputCommand()) {

            if (interaction.commandName === "노래채널생성") {
                return command.execute(interaction, client);
            }
        }
    });
};