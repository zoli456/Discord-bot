const {
  EmbedBuilder,
  MessageFlags,
  InteractionContextType,
} = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");
const fs = require("fs");
const path = require("path");

const command = new SlashCommand()
  .setName("reload")
  .setDescription("Reload all commands")
  .setContexts(InteractionContextType.Guild)
  .setRun(async (client, interaction, options) => {
    const guildSettings = client.guild_settings.find(
      (e) => e.guildId === interaction.guildId,
    );
    const lang = client.localization_manager.getLanguage(
      await guildSettings.settings_db.getData("/language"),
    );
    if (client.commandLimiter.take(interaction.member.id)) {
      client.log(
        `${interaction.guild.name}(${interaction.guildId}) | User hit the rate limit: ${interaction.user.username}(${interaction.member.id}).`,
      );
      return interaction.reply({
        embeds: [client.ErrorEmbed(lang.error_title, lang.please_wait_between)],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.user.id === process.env.ADMINID) {
      try {
        let ContextCommandsDirectory = path.join(__dirname, "..", "context");
        fs.readdir(ContextCommandsDirectory, (err, files) => {
          files.forEach((file) => {
            delete require.cache[
              require.resolve(ContextCommandsDirectory + "/" + file)
            ];
            let cmd = require(ContextCommandsDirectory + "/" + file);
            if (!cmd.command || !cmd.run) {
              return this.warn(
                "❌ Unable to load Command: " +
                  file.split(".")[0] +
                  ", File doesn't have either command/run",
              );
            }
            client.contextCommands.set(file.split(".")[0].toLowerCase(), cmd);
          });
        });

        let SlashCommandsDirectory = path.join(__dirname, "..", "slash");
        fs.readdir(SlashCommandsDirectory, (err, files) => {
          files.forEach((file) => {
            delete require.cache[
              require.resolve(SlashCommandsDirectory + "/" + file)
            ];
            let cmd = require(SlashCommandsDirectory + "/" + file);

            if (!cmd || !cmd.run) {
              return client.warn(
                "❌ Unable to load Command: " +
                  file.split(".")[0] +
                  ", File doesn't have a valid command with run function",
              );
            }
            client.slashCommands.set(file.split(".")[0].toLowerCase(), cmd);
          });
        });

        const totalCmds =
          client.slashCommands.size + client.contextCommands.size;
        client.log(`Reloaded ${totalCmds} commands!`);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(`Sucessfully Reloaded \`${totalCmds}\` Commands!`)
              .setFooter({
                text: `${client.user.username} was reloaded by ${interaction.user.username}`,
              })
              .setTimestamp(),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } catch (err) {
        console.log(err);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(
                "An error has occured. For more details please check console.",
              ),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  });

module.exports = command;
