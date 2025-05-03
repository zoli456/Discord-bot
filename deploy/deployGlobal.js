import { REST, Routes } from "discord.js";
import getConfig from "../util/getConfig.js";
import LoadCommands from "../util/loadCommands.js";

function updateCommands() {
  (async () => {
    try {
      const config = await getConfig();
      const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
      const { slash, context } = await LoadCommands();

      // Filter out any null/undefined commands that might have slipped through
      const commands = [
        ...slash, ...context,
      ].filter((cmd) => cmd && cmd.name);

      console.log(`Starting deployment of ${commands.length} commands...`);

      const data = await rest.put(Routes.applicationCommands(config.clientId), { body: commands });

      console.log(`Successfully deployed ${data.length} commands globally!`);
    } catch (error) {
      console.error("Failed to deploy commands:", error);
      // More detailed error logging
      if (error.data?.errors) {
        console.error("Detailed errors:", JSON.stringify(error.data.errors, null, 2));
      }
    }
  })();
}
export default updateCommands;
