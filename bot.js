const { config } = require("dotenv");

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
config();

const { eventLoad } = require('./src/eventLoader');
const client = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction
  ]
});

client.events = new Collection();
eventLoad(client)

client.login(process.env.BOT_TOKEN).then(() => {
    console.log("Bot logged in successfully.");
  }).catch(err => {
    console.error("Failed to log in:", err);
  });