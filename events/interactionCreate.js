const Controller = require("../util/Controller");
const voice_controller = require("../util/voice_controller");
const yt = require("youtube-sr").default;
const colors = require("@colors/colors");
/**
 *
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {import("discord.js").Interaction}interaction
 */
module.exports = async (client, interaction) => {
  if (interaction.isChatInputCommand()) {
    let command = client.slashCommands.find(
      (x) => x.name === interaction.commandName,
    );
    if (!command || !command.run) {
      return interaction.reply(
        "Sorry the command you used doesn't have any run function",
      );
    }
    let options = "";
    for (let i = 0; i < interaction.options._hoistedOptions.length; i++) {
      options += `${interaction.options._hoistedOptions[i].name}(${interaction.options._hoistedOptions[i].value}) `;
    }
    if (interaction.options._subcommand) {
      client.logger.log(
        `${colors.blue(interaction.user.username)}(${interaction.user.id}) ran ${colors.blue(interaction.commandName)}->${colors.yellow(interaction.options._subcommand)} command in ${colors.blue(interaction.guild.name)}(${interaction.guild.id}): ${options}`,
      );
    } else {
      client.logger.log(
        `${colors.blue(interaction.user.username)}(${interaction.user.id}) ran ${colors.blue(interaction.commandName)} command in ${colors.blue(interaction.guild.name)}(${interaction.guild.id}): ${options}`,
      );
    }

    client.commandsRan++;
    command.run(client, interaction, interaction.options);
    return;
  }
  if (interaction.isCommand()) {
    let command = client.contextCommands.find(
      (x) => x.command.name === interaction.commandName,
    );
    if (!command || !command.run) {
      return interaction.reply(
        "Sorry the command you used doesn't have any run function",
      );
    }

    client.commandsRan++;
    command.run(client, interaction, interaction.options);
    return;
  }
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("controller")) {
      await Controller(client, interaction);
    }
    if (interaction.customId.startsWith("voice_controller")) {
      await voice_controller(client, interaction);
    }
  }

  if (interaction.isAutocomplete()) {
    const url = interaction.options.getString("query");
    if (url === "") return;

    const match = [
      /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/,
    ].some(function (match) {
      return match.test(url) === true;
    });

    async function checkRegex() {
      if (match === true) {
        let choice = [];
        choice.push({ name: url, value: url });
        await interaction.respond(choice).catch(() => {});
      }
    }

    const Random = "ytsearch"[Math.floor(Math.random() * "ytsearch".length)];

    if (interaction.commandName === "play") {
      await checkRegex();
      await checkRegex();
      let choice = [];
      await yt
        .search(url || Random, { safeSearch: false, limit: 25 })
        .then((result) => {
          result.forEach((x) => {
            choice.push({ name: x.title, value: x.url });
          });
        });
      return await interaction.respond(choice).catch(() => {});
    } else if (result.loadType === "error" || "empty") return;
  }
};
