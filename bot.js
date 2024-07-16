const { config } = require("dotenv");

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits;
const { Message, GuildMember } = Partials;
config();

const { eventLoad } = require('./src/eventLoader');
const client = new Client({
  intents: [Guilds, GuildMessages, MessageContent],
  partials: [Message, GuildMember],
});

client.events = new Collection();
eventLoad(client)

client.login(process.env.BOT_TOKEN).then(() => {
    console.log("Bot logged in successfully.");
  }).catch(err => {
    console.error("Failed to log in:", err);
  });