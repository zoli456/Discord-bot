//Deletes every commands from every server yikes!!1!!11!!
import readline from 'readline';

import { REST } from 'discord.js';
import { Routes } from 'discord.js';
import getConfig from '../util/getConfig';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  const config = await getConfig();
  const rest = new REST().setToken(config.token);

  if (!process.argv.includes("--global")) {
    rl.question("Enter the guild id you wanted to delete commands: ", async (guild) => {
      console.log("Evil bot has been started to delete commands...");
      await rest
        .put(Routes.applicationGuildCommands(config.clientId, guild), {
          body: [],
        })
        .catch(console.log);
      console.log("Evil bot has done the deed, exiting...");
      rl.close();
    });
  } else {
    console.log("Evil bot has been started to delete global commands...");
    await rest
      .put(Routes.applicationCommands(config.clientId), {
        body: [],
      })
      .catch(console.log);
    console.log("Evil bot has done the deed, exiting...");
    process.exit();
  }
})();
