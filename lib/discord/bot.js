//OTgwMTY1ODE4Mzg4MTg1MDg5.GbBEwv.gfqbGyzIYtYTPh2eZOVq70dneM5qgaFnkdWvyM

const { Client, Intents } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

let botCache = null;
const bot = new Promise((resolve, reject) => {
  if (botCache) {
    resolve(botCache);
  } else
    client.on("ready", () => {
      botCache = client;
      resolve(client);
    });
});

client.login(
  "OTgwMTY1ODE4Mzg4MTg1MDg5.GbBEwv.gfqbGyzIYtYTPh2eZOVq70dneM5qgaFnkdWvyM"
);

export default bot;
