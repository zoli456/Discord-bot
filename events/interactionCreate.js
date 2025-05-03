import Controller from "../util/Controller.js";
import voice_controller from "../util/voice_controller.js";
import { YouTube } from "youtube-sr";
import colors from "@colors/colors";

/**
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {import("discord.js").Interaction} interaction
 */
export default async (client, interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.slashCommands.find((x) => x.name === interaction.commandName);
    if (!command?.run) {
      return interaction.reply("Sorry the command you used doesn't have any run function");
    }

    const options = interaction.options._hoistedOptions
      .map((opt) => `${opt.name}(${opt.value})`)
      .join(" ");

    const logMessage = interaction.options._subcommand
      ? `${colors.blue(interaction.user.username)}(${interaction.user.id}) ran ${colors.blue(interaction.commandName)}->${colors.yellow(interaction.options._subcommand)} command in ${colors.blue(interaction.guild.name)}(${interaction.guild.id}): ${options}`
      : `${colors.blue(interaction.user.username)}(${interaction.user.id}) ran ${colors.blue(interaction.commandName)} command in ${colors.blue(interaction.guild.name)}(${interaction.guild.id}): ${options}`;

    client.logger.log(logMessage);
    client.commandsRan++;

    return command.run(client, interaction, interaction.options);
  }

  if (interaction.isCommand()) {
    const command = client.contextCommands.find((x) => x.command.name === interaction.commandName);
    if (!command?.run) {
      return interaction.reply("Sorry the command you used doesn't have any run function");
    }

    client.commandsRan++;
    return command.run(client, interaction, interaction.options);
  }

  if (interaction.isButton()) {
    if (interaction.customId.startsWith("controller")) {
      return Controller(client, interaction);
    }
    if (interaction.customId.startsWith("voice_controller")) {
      return voice_controller(client, interaction);
    }
  }

  if (interaction.isAutocomplete()) {
    const url = interaction.options.getString("query");
    if (!url) return;

    const urlRegex =
      /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/;
    const isUrl = urlRegex.test(url);

    const checkRegex = async () => {
      if (isUrl) {
        await interaction
          .respond([
            { name: url, value: url },
          ])
          .catch(() => {});
      }
    };

    const randomChar = "ytsearch"[Math.floor(Math.random() * "ytsearch".length)];

    if (interaction.commandName === "play") {
      await checkRegex();

      try {
        const results = await YouTube.search(url || randomChar, { safeSearch: false, limit: 25 });
        const choices = results.map((x) => ({ name: x.title, value: x.url }));
        return interaction.respond(choices).catch(() => {});
      } catch (error) {
        console.error("YouTube search error:", error);
        return interaction.respond([]).catch(() => {});
      }
    }
  }
};
