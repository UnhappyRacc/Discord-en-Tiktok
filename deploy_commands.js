const { REST, Routes } = require('discord.js');
require('dotenv').config();
const rest = new REST({ version: '10' }).setToken('...');
const CLIENT_ID = '1491465582669987900';

const commands = [
  {
    name: 'ping',
    description: 'Check of de bot werkt'
  },
  {
    name: 'setchannel',
    description: 'Stel het kanaal in waar de bot berichten stuurt',
    options: [
      {
        name: 'kanaal',
        description: 'Kies een kanaal',
        type: 7, // CHANNEL
        required: true
      }
    ]
  },
  {
    name: 'settiktok',
    description: 'Stel TikTok account in',
    options: [
      {
        name: 'username',
        description: 'TikTok username (zonder @)',
        type: 3, // STRING
        required: true
      }
    ]
  }
];

(async () => {
  try {
    console.log('🔄 Commands registreren...');

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log('✅ Commands zijn geladen!');
  } catch (error) {
    console.error(error);
  }
})();