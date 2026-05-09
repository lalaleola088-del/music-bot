module.exports = async (interaction, client) => {

    const player = client.lavalink.getPlayer(interaction.guild.id);

    if (!player) {
        return interaction.reply({
            content: "재생중인 노래 없음",
            ephemeral: true
        });
    }

    if (interaction.customId === "skip") {
        player.skip();

        return interaction.reply({
            content: "⏭️ 스킵",
            ephemeral: true
        });
    }

    if (interaction.customId === "stop") {
        player.destroy();

        return interaction.reply({
            content: "⏹️ 정지",
            ephemeral: true
        });
    }

    if (interaction.customId === "pause") {
        player.pause(!player.paused);

        return interaction.reply({
            content: player.paused
                ? "⏸️ 일시정지"
                : "▶️ 다시재생",
            ephemeral: true
        });
    }
};