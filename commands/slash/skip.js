const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder, InteractionContextType } = require("discord.js");

const command = new SlashCommand()
  .setName("skip")
  .setDescription("Skip the current song")
  .setNameLocalizations({
    hu: "kihagy",
  })
  .setDescriptionLocalizations({
    hu: "Kihagyja az éppen szóló dalt.",
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
    if (client.playerLimiter.take(interaction.guild.id)) {
      client.log(
        `${interaction.guildId} | User hit the rate limit on the player: ${interaction.user.username}(${interaction.member.id}).`,
      );
      return interaction.reply({
        embeds: [client.ErrorEmbed(lang.error_title, lang.please_wait_button)],
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
            .setDescription(lang.nothing_to_skip),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    const song = player.queue.current;
    const autoQueue = player.get("autoQueue");
    /*if (
      player.queue.tracks[0] === undefined &&
      (!autoQueue || autoQueue === false)
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setDescription(
              `${lang.skip1} [${song.info.title}](${song.info.uri}) ${lang.skip2}.`,
            ),
        ],
      });
    }*/

    // player.queue.previous = player.queue.current;
    if (player.queue.tracks[0] === undefined) {
      player.set("autoQueue", false);
      await player.stopPlaying();
    } else {
      player.skip(false);
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setDescription(lang.skipped),
      ],
    });
  });

module.exports = command;
