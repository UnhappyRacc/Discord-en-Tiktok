require('dotenv').config();

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const Parser = require('rss-parser');
const axios = require('axios');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const parser = new Parser();

console.log("🚀 Script gestart...");

client.once('clientReady', c => {
  console.log(`✅ Online als ${c.user.tag}`);
});

// 📂 config laden
let config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// 💾 save functie (HIER!)
function saveConfig() {
  fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
}
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // 🏓 ping
  if (interaction.commandName === 'ping') {
    return interaction.reply('🏓 Pong!');
  }

  // ⚙️ setchannel
  if (interaction.commandName === 'setchannel') {
    const kanaal = interaction.options.getChannel('kanaal');

    config.channelId = kanaal.id;

    // 💾 opslaan
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

    return interaction.reply({
      content: `✅ Kanaal opgeslagen: ${kanaal}`,
      flags: 64
    });
  }
if (interaction.commandName === 'settiktok') {
  await interaction.deferReply({ flags: 64 });

  try {
    const username = interaction.options.getString('username');

    config.tiktokUser = username;
    config.lastVideo = null;
    saveConfig();

    await interaction.editReply({
      content: `✅ TikTok account ingesteld: @${username}`
    });

  } catch (err) {
    console.error(err);

    await interaction.editReply({
      content: '❌ Er ging iets mis!'
    });
  }
}
});

// 🔁 TikTok checker

setInterval(async () => {
  try {
    console.log("🔄 TikTok check gestart...");

    if (!config.tiktokUser || !config.channelId) {
      console.log("❌ Geen user of channel");
      return;
    }

    const res = await axios.get(`https://www.tiktok.com/@${config.tiktokUser}`, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = res.data;

    // 🔥 haal SIGI_STATE JSON eruit
    const jsonMatch = html.match(/<script id="SIGI_STATE"[^>]*>(.*?)<\/script>/);

    if (!jsonMatch) {
      console.log("❌ SIGI JSON niet gevonden");
      return;
    }

    const json = JSON.parse(jsonMatch[1]);

    const items = json.ItemModule;

    if (!items) {
      console.log("❌ Geen items gevonden");
      return;
    }

    // 🔥 pak alle videos
    const videos = Object.values(items);

    if (videos.length === 0) {
      console.log("❌ Geen video's");
      return;
    }

    // 🔥 sorteer op createTime (nieuwste eerst)
    videos.sort((a, b) => b.createTime - a.createTime);

    const newest = videos[0];

    const videoLink = `https://www.tiktok.com/@${config.tiktokUser}/video/${newest.id}`;

    console.log("🎥 Nieuwste video:", videoLink);

    if (videoLink !== config.lastVideo) {
      console.log("🚀 NIEUWE TIKTOK!");

      config.lastVideo = videoLink;
      saveConfig();

      const channel = await client.channels.fetch(config.channelId);
      if (!channel) return;

      await channel.send(`📢 Nieuwe TikTok!\n${videoLink}`);
    } else {
      console.log("⏸️ Geen nieuwe video");
    }

  } catch (err) {
    console.log("❌ TikTok error:", err.message);
  }
}, 60000);
client.login(process.env.TOKEN);