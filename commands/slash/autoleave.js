const colors = require("@colors/colors");
const {
  EmbedBuilder,
  InteractionContextType,
  PermissionsBitField,
} = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("autoleave")
  .setDescription(
    "Automatically leaves when everyone leaves the voice channel (toggle)",
  )
  .setContexts(InteractionContextType.Guild)
  .setRun(async (client, interaction) => {
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
    if (
      interaction.memberPermissions.has(
        PermissionsBitField.Flags.Administrator,
      ) ||
      interaction.user.id === process.env.ADMINID
    ) {
      let channel = await client.getChannel(client, interaction);
      if (!channel) return;

      let player;
      if (client.manager)
        player = client.manager.getPlayer(interaction.guild.id);
      else
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FF0000")
              .setDescription("Lavalink node is not connected"),
          ],
        });

      if (!player) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FF0000")
              .setDescription("There's nothing playing in the queue"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      let autoLeaveEmbed = new EmbedBuilder().setColor(
        client.config.embedColor,
      );
      const autoLeave = player.get("autoLeave");
      player.set("requester", interaction.guild.me);

      if (!autoLeave || autoLeave === false) {
        player.set("autoLeave", true);
      } else {
        player.set("autoLeave", false);
      }
      autoLeaveEmbed
        .setDescription(`**Auto Leave is** \`${!autoLeave ? "ON" : "OFF"}\``)
        .setFooter({
          text: `The player will ${
            !autoLeave ? "now automatically" : "not automatically"
          } leave when the voice channel is empty.`,
        });
      client.warn(
        `Player: ${player.options.guildId} | [${colors.blue(
          "autoLeave",
        )}] has been [${colors.blue(!autoLeave ? "ENABLED" : "DISABLED")}] in ${
          client.guilds.cache.get(player.options.guildId)
            ? client.guilds.cache.get(player.options.guildId).name
            : "a guild"
        }`,
      );

      return interaction.reply({ embeds: [autoLeaveEmbed] });
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
