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
      console.log("❌ Geen user of channel ingesteld");
      return;
    }

    const res = await axios.get(`https://www.tiktok.com/@${config.tiktokUser}`, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = res.data;

    const matches = html.match(/\/video\/\d+/g);

    if (!matches) {
      console.log("❌ Geen video's gevonden");
      return;
    }

    const videoLink = `https://www.tiktok.com${matches[0]}`;

    console.log("🎥 Laatste video:", videoLink);

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