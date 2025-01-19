const { EmbedBuilder, MessageFlags } = require("discord.js");
const colors = require("@colors/colors");
/**
 *
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {import("discord.js").ButtonInteraction} interaction
 */
module.exports = async (client, interaction) => {
  let guild = client.guilds.cache.get(interaction.customId.split(":")[1]);
  let property = interaction.customId.split(":")[2];
  let player = client.manager.getPlayer(guild.id);

  const guild_settings = client.guild_settings.find(
    (e) => e.guildId === player.guildId,
  );
  const lang = client.localization_manager.getLanguage(
    await guild_settings.settings_db.getData("/language"),
  );

  if (!player) {
    await interaction.reply({
      embeds: [client.ErrorEmbed(lang.error_title, lang.no_player)],
    });
    setTimeout(() => {
      interaction.deleteReply();
    }, 5000);
    return;
  }
  if (!interaction.member.voice.channel) {
    return interaction
      .reply({
        embeds: [
          client.WarningEmbed(lang.warning_title, lang.you_must_be_action),
        ],
        flags: MessageFlags.Ephemeral,
      })
      .then((msg) => {
        setTimeout(() => msg.delete(), 20000);
      });
  }

  if (
    interaction.guild.members.me.voice.channel &&
    !interaction.guild.members.me.voice.channel.equals(
      interaction.member.voice.channel,
    )
  ) {
    return await interaction
      .reply({
        embeds: [
          client.WarningEmbed(lang.warning_title, lang.you_must_be_same),
        ],
        flags: MessageFlags.Ephemeral,
      })
      .then((msg) => {
        setTimeout(() => msg.delete(), 20000);
      });
  }
  if (client.playerLimiter.take(interaction.guild.id)) {
    client.log(
      `${colors.blue(interaction.guild.name)}(${interaction.guildId}) | User hit the rate limit on the player: ${colors.blue(interaction.user.username)}(${interaction.member.id}).`,
    );
    return interaction
      .reply({
        embeds: [client.ErrorEmbed(lang.error_title, lang.please_wait_button)],
        flags: MessageFlags.Ephemeral,
      })
      .then((msg) => {
        setTimeout(() => msg.delete(), 20000);
      });
  }

  if (property === "Stop") {
    // player.skip(false);
    player.set("autoQueue", false);
    //player.queue.tracks = [];
    // player.queue.tracks.previous = [];
    await player.stopPlaying();
    //player.destroy("stopped", false);
    //player.queue = null;
    /* player.queue.clear();
    player.stop();*/
    client.log(
      `${colors.blue(interaction.guild.name)}(${interaction.guildId}) | Successfully stopped the player by ${colors.blue(interaction.user.username)}(${interaction.member.id})`,
    );
    const msg = await interaction.channel.send({
      embeds: [client.Embed(lang.successfully_stopped)],
    });
    setTimeout(() => {
      msg.delete();
    }, 5000);

    /* interaction.update({
      components: [client.createController(player.options.guildId, player)],
    });*/
    return;
  }

  // if theres no previous song, return an error.
  if (property === "Replay") {
    if (player.queue.previous.length === 0) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setDescription(lang.no_previous),
        ],
      });
    }
    const track = player.queue.previous.shift();
    player.queue.add(track, 0);
    player.LavalinkManager.once("trackEnd", (player) => {
      player.queue.add(player.queue.previous.shift(), 0);
    });
    //player.setNowplayingMessage(null);
    player.skip(false);
    return;
  }

  if (property === "PlayAndPause") {
    if (!player /*|| !player.playing && player.queue.tracks.length === 0*/) {
      const msg = await interaction.channel.send({
        flags: MessageFlags.Ephemeral,
        embeds: [
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.no_song),
        ],
      });
      setTimeout(() => {
        msg.delete();
      }, 5000);
      return interaction.deferUpdate();
    } else {
      if (player.paused) {
        await player.resume();
      } else {
        await player.pause();
      }
      client.log(
        `${colors.blue(interaction.guild.name)}(${interaction.guildId}) Successfully ${
          player.paused ? "paused" : "resumed"
        } the player by ${colors.blue(interaction.user.username)}(${interaction.member.id})`,
      );

      return interaction.update({
        components: [client.createController(player.options.guildId, player)],
      });
    }
  }

  if (property === "Next") {
    const song = player.queue.current;
    const autoQueue = player.get("autoQueue");
    if (
      player.queue.tracks.length === 0 &&
      (!autoQueue || autoQueue === false)
    ) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setDescription(
              `${lang.nothing_after} [${song.info.title}](${song.info.uri}) ${lang.in_the_queue}`,
            ),
        ],
      });
    } else {
      //player.setNowplayingMessage(null);
      player.skip(0, false);
    }
    return interaction.deferUpdate;
  }

  if (property === "Loop") {
    if (player.repeatMode === "off") {
      const msg = await interaction.channel.send({
        flags: MessageFlags.Ephemeral,
        embeds: [
          new EmbedBuilder()
            .setColor("#FFFFFF")
            .setDescription(lang.repeat_song),
        ],
      });
      setTimeout(() => {
        msg.delete();
      }, 10000);
      player.setRepeatMode("track");
    } else if (player.repeatMode === "track") {
      const msg = await interaction.channel.send({
        flags: MessageFlags.Ephemeral,
        embeds: [
          new EmbedBuilder()
            .setColor("#FFFFFF")
            .setDescription(lang.repeat_queue),
        ],
      });
      setTimeout(() => {
        msg.delete();
      }, 10000);
      player.setRepeatMode("queue");
    } else {
      const msg = await interaction.channel.send({
        flags: MessageFlags.Ephemeral,
        embeds: [
          new EmbedBuilder()
            .setColor("#FFFFFF")
            .setDescription(lang.repeat_off),
        ],
      });
      setTimeout(() => {
        msg.delete();
      }, 10000);
      player.setRepeatMode("off");
    }
    client.log(
      `${colors.blue(interaction.guild.name)}(${interaction.guildId}) | Successfully toggled loop ${
        player.repeatMode === "track"
          ? "on"
          : player.repeatMode === "queue"
            ? "queue on"
            : "off"
      } the player by ${colors.blue(interaction.user.username)}(${interaction.member.id})`,
    );

    interaction.update({
      components: [client.createController(player.options.guildId, player)],
    });
    return;
  }

  return interaction.reply({
    embed: [client.ErrorEmbed(lang.error_title, lang.unknown_option)],
    flags: MessageFlags.Ephemeral,
  });
};
