const colors = require("@colors/colors");
const { EmbedBuilder, InteractionContextType, PermissionsBitField } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("autopause")
  .setDescription("Automatically pause when everyone leaves the voice channel (toggle)")
  .setNameLocalizations({
    hu: "auto_szünet",
  })
  .setDescriptionLocalizations({
    hu: "Beállítja, hogy automatikusan szüneteltesse a dalt ha mindenki kilép a csatornáról.",
  })
  .setContexts(InteractionContextType.Guild)
  .setRun(async (client, interaction) => {
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
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      let channel = await client.getChannel(client, interaction);
      if (!channel) return;

      let player;
      if (client.manager) player = client.manager.getPlayer(interaction.guild.id);
      else
        return interaction.reply({
          embeds: [
            new EmbedBuilder().setColor("#FF0000").setDescription(lang.lavalink_not_connected),
          ],
        });

      if (!player) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder().setColor("#FF0000").setDescription(lang.nothing_to_play),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      let autoPauseEmbed = new EmbedBuilder().setColor(client.config.embedColor);
      const autoPause = player.get("autoPause");
      player.set("requester", interaction.guild.members.me);

      if (!autoPause || autoPause === false) {
        player.set("autoPause", true);
      } else {
        player.set("autoPause", false);
      }
      autoPauseEmbed
        .setDescription(`${lang.autopause_is} \`${!autoPause ? lang.ON : lang.OFF}\``)
        .setFooter({
          text: `${lang.the_player_will} ${
            !autoPause ? lang.automatically : lang.no_longer_be
          } ${lang.the_player_will2}`,
        });
      client.warn(
        `Player: ${player.options.guildId} | [${colors.blue(
          "AUTOPAUSE",
        )}] has been [${colors.blue(!autoPause ? "ENABLED" : "DISABLED")}] in ${
          client.guilds.cache.get(player.options.guildId)
            ? client.guilds.cache.get(player.options.guildId).name
            : "a guild"
        }`,
      );

      return interaction.reply({
        embeds: [
          autoPauseEmbed,
        ],
      });
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
