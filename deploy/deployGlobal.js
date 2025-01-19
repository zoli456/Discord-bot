const { REST } = require("discord.js");
const { Routes } = require("discord.js");
const getConfig = require("../util/getConfig");
const LoadCommands = require("../util/loadCommands");

(async () => {
  const config = await getConfig();
  const rest = new REST().setToken(process.env.TOKEN);
  const commands = await LoadCommands().then((cmds) => {
    return [].concat(cmds.slash).concat(cmds.context);
  });

  console.log("Deploying commands to global...");
  await rest
    .put(Routes.applicationCommands(config.clientId), {
      body: commands,
    })
    .catch(console.log);
  console.log("Successfully deployed commands!");
})();
