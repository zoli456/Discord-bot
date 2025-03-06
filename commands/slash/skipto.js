const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder, InteractionContextType } = require("discord.js");

const command = new SlashCommand()
  .setName("skipto")
  .setDescription("skip to a specific song in the queue")
  .setNameLocalizations({
    hu: "kihagy_eddig",
  })
  .setDescriptionLocalizations({
    hu: "Kihagyja a dalokat egy bizonyos pozícióig..",
  })
  .setContexts(InteractionContextType.Guild)
  .addNumberOption((option) =>
    option
      .setName("number")
      .setDescription("The number of tracks to skipto")
      .setNameLocalizations({
        hu: "pozíció",
      })
      .setDescriptionLocalizations({
        hu: "Meddig ugorjak a várólistán?.",
      })
      .setRequired(true),
  )

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
    //const duration = player.queue.current.duration

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
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.iam_not_in_a_channel),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply();

    const position = Number(args);

    try {
      if (!position || position < 0 || position > player.queue.tracks.length) {
        return interaction.editReply({
          embeds: [
            client.ErrorEmbed(lang.error_title, lang.invalid_position),
          ],
        });
      }

      /* player.queue.remove(0, position - 1);
      player.stop();*/
      player.skip(position);

      let thing = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setDescription(lang.skipped_to + position);

      return interaction.editReply({
        embeds: [
          thing,
        ],
      });
    } catch {
      if (position === 1) {
        player.stop();
      }
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription(lang.skipped_to + position),
        ],
      });
    }
  });

module.exports = command;
