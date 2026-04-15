const express = require("express");
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  Events
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState
} = require("@discordjs/voice");

const play = require("play-dl");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const PORT = process.env.PORT || 3000;

// Render용 간단한 웹 서버
const app = express();
app.get("/", (req, res) => {
  res.send("Discord music bot is running.");
});
app.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("환경변수 DISCORD_TOKEN, CLIENT_ID, GUILD_ID 를 모두 넣어야 합니다.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

const player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Pause
  }
});

const commands = [
  new SlashCommandBuilder()
    .setName("재생")
    .setDescription("유튜브 링크 또는 검색어로 노래를 재생합니다.")
    .addStringOption(option =>
      option
        .setName("곡")
        .setDescription("유튜브 링크 또는 검색어")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("정지")
    .setDescription("재생을 멈춥니다."),

  new SlashCommandBuilder()
    .setName("나가")
    .setDescription("음성채널에서 나갑니다.")
].map(command => command.toJSON());

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  console.log("슬래시 명령어 등록 완료");
}

async function getStream(query) {
  let url = query;

  if (!play.yt_validate(query) || play.yt_validate(query) === "search") {
    const results = await play.search(query, { limit: 1 });
    if (!results || results.length === 0) {
      throw new Error("검색 결과가 없습니다.");
    }
    url = results[0].url;
  }

  const stream = await play.stream(url, {
    discordPlayerCompatibility: true
  });

  return {
    stream: stream.stream,
    type: stream.type,
    url
  };
}

async function connectToVoice(channel) {
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: true
  });

  await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
  connection.subscribe(player);
  return connection;
}

client.once(Events.ClientReady, async () => {
  console.log(`로그인 완료: ${client.user.tag}`);
  try {
    await registerCommands();
  } catch (error) {
    console.error("명령어 등록 실패:", error);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    if (interaction.commandName === "재생") {
      const member = interaction.member;
      const voiceChannel = member.voice.channel;

      if (!voiceChannel) {
        return await interaction.reply({
          content: "먼저 음성채널에 들어가 주세요.",
          ephemeral: true
        });
      }

      await interaction.deferReply();

      const query = interaction.options.getString("곡", true);
      const { stream, type, url } = await getStream(query);

      const connection = await connectToVoice(voiceChannel);

      const resource = createAudioResource(stream, {
        inputType: type,
        inlineVolume: true
      });

      resource.volume.setVolume(0.5);

      player.play(resource);

      player.once(AudioPlayerStatus.Playing, async () => {
        await interaction.editReply(`재생 시작: ${url}`);
      });

      player.once(AudioPlayerStatus.Idle, async () => {
        console.log("재생 완료");
      });

      connection.on("error", console.error);
      player.on("error", console.error);
    }

    if (interaction.commandName === "정지") {
      player.stop(true);
      return await interaction.reply("재생을 정지했어.");
    }

    if (interaction.commandName === "나가") {
      const connection = getVoiceConnection(interaction.guild.id);
      if (connection) {
        connection.destroy();
      }
      player.stop(true);
      return await interaction.reply("음성채널에서 나갔어.");
    }
  } catch (error) {
    console.error(error);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply("오류가 났어. 유튜브 링크나 검색어를 다시 시도해봐.");
    } else {
      await interaction.reply({
        content: "오류가 났어. 다시 시도해봐.",
        ephemeral: true
      });
    }
  }
});

client.login(TOKEN);
