const { EmbedBuilder, InteractionContextType } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");
const fs = require("fs");
const path = require("path");
const { forEach } = require("lodash");

const command = new SlashCommand()
  .setName("guildleave")
  .setDescription("leaves a guild")
  .addStringOption((option) =>
    option
      .setName("id")
      .setDescription("Enter the guild id to leave (type `list` for guild ids)")
      .setRequired(true),
  )
  .setContexts(InteractionContextType.Guild)
  .setRun(async (client, interaction, options) => {
    const guildSettings = client.guild_settings.find((e) => e.guildId === interaction.guildId);
    const lang = client.localization_manager.getLanguage(
      await guildSettings.settings_db.getData("/language"),
    );
    if (client.commandLimiter.take(interaction.member.id)) {
      client.log(
        `${interaction.guild.name}(${interaction.guildId}) | User hit the rate limit: ${interaction.user.username}(${interaction.member.id}).`,
      );
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.please_wait_between),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.user.id === process.env.ADMINID) {
      try {
        const id = interaction.options.getString("id");

        if (id.toLowerCase() === "list") {
          client.guilds.cache.forEach((guild) => {
            console.log(`${guild.name} | ${guild.id}`);
          });
          const guild = client.guilds.cache.map((guild) => ` ${guild.name} | ${guild.id}`);
          try {
            return interaction.reply({
              content: `Guilds:\n\`${guild}\``,
              flags: MessageFlags.Ephemeral,
            });
          } catch {
            return interaction.reply({
              content: `check console for list of guilds`,
              flags: MessageFlags.Ephemeral,
            });
          }
        }

        const guild = client.guilds.cache.get(id);

        if (!guild) {
          return interaction.reply({
            content: `\`${id}\` is not a valid guild id`,
            flags: MessageFlags.Ephemeral,
          });
        }

        await guild
          .leave()
          .then((c) => console.log(`left guild ${id}`))
          .catch((err) => {
            console.log(err);
          });
        return interaction.reply({
          content: `left guild \`${id}\``,
          flags: MessageFlags.Ephemeral,
        });
      } catch (error) {
        console.log(`there was an error trying to leave guild ${id}`, error);
      }
    } else {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  });

module.exports = command;
