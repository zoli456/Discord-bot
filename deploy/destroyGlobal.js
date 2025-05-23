import { Client, Intents } from 'discord.js';
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES,
  ],
});
import config from '../config';

client.login(process.env.TOKEN);

client.on("ready", async () => {
  const commands = await client.application.commands.fetch();

  if (commands.size === 0) {
    console.log("Could not find any global commands.");
    process.exit();
  }

  let deletedCount = 0;

  commands.forEach(async (command) => {
    await client.application.commands.delete(command.id);
    console.log(`Slash Command with ID ${command.id} has been deleted.`);
    deletedCount++;

    if (deletedCount === commands.size) {
      console.log(`Successfully deleted all global slash commands.`);
      process.exit();
    }
  });
});
