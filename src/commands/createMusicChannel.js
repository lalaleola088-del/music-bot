const {
    SlashCommandBuilder,
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("노래채널생성")
        .setDescription("음악 전용 채널 생성"),

    async execute(interaction, client) {

        const channel = await interaction.guild.channels.create({
            name: "🎵-music",
            type: ChannelType.GuildText
        });

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("🎵 음악 플레이어")
            .setDescription("노래 제목 또는 링크 입력")
            .setImage("https://i.imgur.com/8km5G9p.png")
            .setFooter({
                text: client.user.username,
                iconURL: client.user.displayAvatarURL()
            });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("skip")
                .setEmoji("⏭️")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("stop")
                .setEmoji("⏹️")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("pause")
                .setEmoji("⏸️")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("queue")
                .setEmoji("📜")
                .setStyle(ButtonStyle.Success)
        );

        const panel = await channel.send({
            embeds: [embed],
            components: [buttons]
        });

        client.musicPanels.set(interaction.guild.id, {
            channelId: channel.id,
            messageId: panel.id
        });

        await interaction.reply({
            content: `생성 완료: ${channel}`,
            ephemeral: true
        });
    }
};