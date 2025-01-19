const colors = require("@colors/colors");
const {
  EmbedBuilder,
  InteractionContextType,
  PermissionsBitField,
} = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("247")
  .setDescription("Prevents the bot from ever disconnecting from a VC (toggle)")
  .setNameLocalizations({
    hu: "24óra",
  })
  .setDescriptionLocalizations({
    hu: "Beállítja, hogy a bot soha ne hagyja el soha a hangcsatornát.",
  })
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
    if (
      interaction.memberPermissions.has(
        PermissionsBitField.Flags.Administrator,
      ) ||
      interaction.user.id === process.env.ADMINID
    ) {
      let channel = await client.getChannel(client, interaction);
      if (!channel) {
        return;
      }

      let player;
      if (client.manager) {
        player = client.manager.getPlayer(interaction.guild.id);
      } else {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FF0000")
              .setDescription(lang.lavalink_not_connected),
          ],
        });
      }

      if (!player) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FF0000")
              .setDescription(lang.nothing_play24),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      let twentyFourSevenEmbed = new EmbedBuilder().setColor(
        client.config.embedColor,
      );
      const twentyFourSeven = player.get("twentyFourSeven");

      if (!twentyFourSeven || twentyFourSeven === false) {
        player.set("twentyFourSeven", true);
      } else {
        player.set("twentyFourSeven", false);
      }
      twentyFourSevenEmbed
        .setDescription(
          `${lang.mod_two_four} \`${!twentyFourSeven ? lang.ON : lang.OFF}\``,
        )
        .setFooter({
          text: `${lang.the_bot_will} ${
            !twentyFourSeven ? lang.now : lang.no_longer
          } ${lang.the_bot_will2}`,
        });
      client.warn(
        `Player: ${player.options.guildId} | [${colors.blue(
          "24/7",
        )}] has been [${colors.blue(
          !twentyFourSeven ? "ENABLED" : "DISABLED",
        )}] in ${
          client.guilds.cache.get(player.options.guildId)
            ? client.guilds.cache.get(player.options.guildId).name
            : "a guild"
        }`,
      );

      if (
        !player.playing &&
        player.queue.tracks.length === 0 &&
        twentyFourSeven
      ) {
        player.destroy();
      }

      return interaction.reply({ embeds: [twentyFourSevenEmbed] });
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
// check above message, it is a little bit confusing. and erros are not handled. probably should be fixed.
// ok use catch ez kom  follow meh ;_;
// the above message meaning error, if it cant find it or take too long the bot crashed
// play commanddddd, if timeout or takes 1000 years to find song it crashed
// OKIE, leave the comment here for idk
// Comment very useful, 247 good :+1:
// twentyFourSeven = best;
