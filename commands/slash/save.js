const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder, InteractionContextType } = require("discord.js");
const prettyMilliseconds = require("pretty-ms");

const command = new SlashCommand()
  .setName("save")
  .setDescription("Saves current song to your DM's")
  .setNameLocalizations({
    hu: "mentés",
  })
  .setDescriptionLocalizations({
    hu: "Elküldi privátüzenetben az éppen szóló dalt.",
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
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.lavalink_not_connected),
        ],
      });
    }

    if (!player) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.no_music_right_now),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    const sendtoDmEmbed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setAuthor({
        name: lang.saved_track,
        iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`,
      })
      .setDescription(
        `**${lang.saved1} [${player.queue.current.info.title}](${player.queue.current.info.uri}) ${lang.saved2}**`,
      )
      .addFields(
        {
          name: lang.track_duration,
          value: `\`${prettyMilliseconds(player.queue.current.info.duration, {
            colonNotation: true,
          })}\``,
          inline: true,
        },
        {
          name: lang.track_author,
          value: `\`${player.queue.current.info.author}\``,
          inline: true,
        },
        {
          name: lang.requested_guild,
          value: `\`${interaction.guild}\``,
          inline: true,
        },
      );

    interaction.user.send({
      embeds: [
        sendtoDmEmbed,
      ],
    });

    return interaction.reply({
      embeds: [
        new EmbedBuilder().setColor(client.config.embedColor).setDescription(lang.check_your_dm),
      ],
      flags: MessageFlags.Ephemeral,
    });
  });

module.exports = command;
