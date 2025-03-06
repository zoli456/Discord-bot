const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder, MessageFlags, InteractionContextType } = require("discord.js");

const command = new SlashCommand()
  .setName("remove")
  .setDescription("Remove track you don't want from queue")
  .setNameLocalizations({
    hu: "eltávolít",
  })
  .setDescriptionLocalizations({
    hu: "Eltávolít egy dalt a várólistáról.",
  })
  .setContexts(InteractionContextType.Guild)
  .addNumberOption((option) =>
    option
      .setName("number")
      .setDescription("Enter track number.")
      .setRequired(true)
      .setNameLocalizations({
        hu: "azonosító",
      })
      .setDescriptionLocalizations({
        hu: "Írd be a dal számát.",
      }),
  )

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
    if (client.playerLimiter.take(interaction.guild.id)) {
      client.log(
        `${interaction.guildId} | User hit the rate limit on the player: ${interaction.user.username}(${interaction.member.id}).`,
      );
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.please_wait_button),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    const args = interaction.options.getNumber("number");

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
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.no_song_remove),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply();

    const position = Number(args) - 1;
    if (position > player.queue.tracks.length) {
      let thing = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setDescription(lang.queue_size.replace("{number}", player.queue.tracks.length));
      return interaction.editReply({
        embeds: [
          thing,
        ],
      });
    }

    //const song = player.queue.tracks[position];
    player.queue.splice(position, 1);

    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setDescription(lang.removed_track.replace("{number}", args)),
      ],
    });
  });

module.exports = command;
