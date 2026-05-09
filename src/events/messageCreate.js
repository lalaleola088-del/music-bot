module.exports = (client) => {

    client.on("messageCreate", async (message) => {

        if (message.author.bot) return;

        const panel = client.musicPanels.get(message.guild.id);
        if (!panel) return;

        if (message.channel.id !== panel.channelId) return;

        if (!message.member.voice.channel) return;

        const query = message.content;

        await message.delete().catch(() => {});

        let player = client.lavalink.getPlayer(message.guild.id);

        if (!player) {

            player = await client.lavalink.createPlayer({
                guildId: message.guild.id,
                voiceChannelId: message.member.voice.channel.id,
                textChannelId: message.channel.id,
                selfDeaf: true,
                volume: 80
            });

            await player.connect();
        }

        const result = await player.search({
            query,
            requester: message.author
        });

        if (!result || !result.tracks.length) {
            return message.channel.send("검색 결과 없음");
        }

        const track = result.tracks[0];

        player.queue.add(track);

        if (!player.playing) {
            await player.play();
        }
    });
};