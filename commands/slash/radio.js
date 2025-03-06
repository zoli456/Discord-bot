const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder, InteractionContextType, ChannelType, escapeMarkdown } = require("discord.js");

const command = new SlashCommand()
  .setName("radio")
  .setDescription("Searches and plays the requested radio.")
  .setNameLocalizations({
    hu: "rádió",
  })
  .setDescriptionLocalizations({
    hu: "Hallgathatsz rádiót.",
  })
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option) =>
    option
      .setName("radio-station")
      .setDescription("Choose a radio station.")
      .setRequired(true)
      .setNameLocalizations({
        hu: "állomás",
      })
      .setDescriptionLocalizations({
        hu: "Válassz egy adót!",
      })
      .addChoices(
        { name: "OXYGEN MUSIC", value: "oxygen" },
        { name: "Radio 1", value: "radio_one" },
        { name: "Retro Rádió", value: "retro" },
        { name: "Petőfi Rádió", value: "petofi" },
        { name: "Kossuth Rádió", value: "kossuth" },
        { name: "Klubrádió", value: "klub" },
        { name: "Karc FM", value: "karcfm" },
        { name: "MegaDance Rádió", value: "mega" },
        { name: "Sláger FM", value: "slager" },
        { name: "Dannibius Rádió", value: "dannibius" },
      ),
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
    let channel = await client.getChannel(client, interaction);
    if (!channel) {
      return;
    }

    /* let node = await client.getLavalink(client);
    if (!node) {
      return interaction.reply({
        embeds: [client.ErrorEmbed(lang.error_title, lang.lavalink_not_connected)],
      });
    }*/
    if (client.manager.nodeManager.nodes.length === 0) {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.lavalink_not_connected),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    let player;
    try {
      player = client.createPlayer(interaction.channel, channel);
    } catch (error) {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.lavalink_not_connected),
        ],
      });
    }

    let ret;
    try {
      ret = await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription(lang.radio_connecting),
        ],
      });
    } catch (e) {
      player.destroy();
      return;
    }

    let query = options.getString("radio-station", true);

    let radio_title;
    let thumbnail;
    if (query == "oxygen") {
      query = "https://oxygenmusic.hu:8000/oxygenmusic_128";
      radio_title = "OXYGEN MUSIC";
      thumbnail = "https://myonlineradio.hu/public/uploads/radio_img/oxygen-music/list_45.png";
    } else if (query == "radio_one") {
      query = "https://icast.connectmedia.hu/5202/live.mp3";
      radio_title = "Radio 1";
      thumbnail = "https://myonlineradio.hu/public/uploads/radio_img/radio-1/list_45.png";
    } else if (query == "retro") {
      query = "https://icast.connectmedia.hu/5002/live.mp3";
      radio_title = "Retro Rádió";
      thumbnail = "https://myonlineradio.hu/public/uploads/radio_img/retro-radio/list_45.png";
    } else if (query == "petofi") {
      query = "https://icast.connectmedia.hu/4738/mr2.mp3";
      radio_title = "Petőfi Rádió";
      thumbnail = "https://myonlineradio.hu/public/uploads/radio_img/mr2-petofi-radio/list_45.jpg";
    } else if (query == "kossuth") {
      query = "https://icast.connectmedia.hu/4736/mr1.mp3";
      radio_title = "Kossuth Rádió";
      thumbnail = "https://myonlineradio.hu/public/uploads/radio_img/mr1-kossuth-radio/list_45.jpg";
    } else if (query == "klub") {
      query = "https://radioplayer.myonlineradio.hu/ldblncr/klubradio/https-bpstream";
      radio_title = "Klubrádió";
      thumbnail = "https://myonlineradio.hu/public/uploads/radio_img/klubradio/list_45.png";
    } else if (query == "karcfm") {
      query = "https://stream.rcs.revma.com/wevb267khf9uv";
      radio_title = "Karc FM";
      thumbnail = "https://myonlineradio.hu/public/uploads/radio_img/karc-fm/list_45.jpg";
    } else if (query == "mega") {
      query = "https://gamershouse.hu/livemega.mp3";
      radio_title = "MegaDance Rádió";
      thumbnail = "https://myonlineradio.hu/public/uploads/radio_img/megadance-radio/list_45.png";
    } else if (query == "slager") {
      query = "https://slagerfm.netregator.hu:7813/slagerfm128.mp3";
      radio_title = "Sláger FM";
      thumbnail = "https://myonlineradio.hu/public/uploads/radio_img/slager-fm/list_45.jpg";
    } else if (query == "dannibius") {
      query = "https://danubiusradio.hu/live.mp3";
      radio_title = "Dannibius Rádió";
      thumbnail = "https://myonlineradio.hu/public/uploads/radio_img/danubius-radio/list_45.png";
    } else {
      return interaction.reply({
        embeds: [
          new EmbedBuilder().setColor(client.config.embedColor).setDescription(lang.error),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    let res = await player.search(query, interaction.user).catch((err) => {
      client.error(err);
      return {
        loadType: "error",
      };
    });

    if (res.loadType === "error") {
      if (!player.queue.current) {
        player.destroy();
      }
      return await interaction
        .editReply({
          embeds: [
            new EmbedBuilder().setColor("#FF0000").setDescription(lang.error_while_searching),
          ],
        })
        .catch(this.warn);
    }

    if (res.loadType === "empty") {
      if (!player.queue.current) {
        player.destroy();
      }
      return await interaction
        .editReply({
          embeds: [
            new EmbedBuilder().setColor("#FF0000").setDescription(lang.no_result),
          ],
        })
        .catch(this.warn);
    }

    if (!player.connected) {
      await player.connect();
    }

    if (channel.type === ChannelType.GuildStageVoice) {
      setTimeout(() => {
        if (interaction.guild.members.me.voice.suppress === true) {
          try {
            interaction.guild.members.me.voice.setSuppressed(false);
          } catch (e) {
            interaction.guild.members.me.voice.setRequestToSpeak(true);
          }
        }
      }, 2000);
    }

    if (res.loadType === "track" || res.loadType === "search") {
      res.tracks[0].info.artworkUrl = thumbnail;
      player.queue.add(res.tracks[0]);

      if (!player?.playing && !player?.paused) {
        await player.play();
      }

      res.tracks[0].info.title = radio_title;

      var title = escapeMarkdown(res.tracks[0].info.title);
      var title = title.replace(/\]/g, "");
      var title = title.replace(/\[/g, "");
      let addQueueEmbed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setAuthor({
          name: lang.added_to_queue,
          iconURL: client.config.iconURL,
        })
        .setDescription(`[${title}](${res.tracks[0].info.uri})` || lang.no_title)
        .setURL(res.tracks[0].info.uri)
        .addFields(
          {
            name: lang.added_by,
            value: `<@${interaction.user.id}>`,
            inline: true,
          },
          {
            name: lang.duration,
            value: res.tracks[0].info.isStream
              ? lang.LIVE
              : `\`${client.ms(res.tracks[0].info.duration, {
                  colonNotation: true,
                  secondsDecimalDigits: 0,
                })}\``,
            inline: true,
          },
        );

      addQueueEmbed.setThumbnail(res.tracks[0].info.artworkUrl);

      if (player?.queue?.tracks?.length > 0) {
        addQueueEmbed.addFields({
          name: lang.position_in_queue,
          value: `${player.queue.tracks.length}`,
          inline: true,
        });
      } else {
        // player.queue.previous = player.queue.current;
      }

      await interaction
        .editReply({
          embeds: [
            addQueueEmbed,
          ],
        })
        .catch(this.warn);
    }

    if (res.loadType === "playlist") {
      player.queue.add(res.tracks);

      if (!player.playing && !player.paused && player.queue.tracks.length === res.tracks.length) {
        await player.play();
      }

      let playlistEmbed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setAuthor({
          name: lang.playlist_to_queue,
          iconURL: client.config.iconURL,
        })
        .setThumbnail(thumbnail)
        .setDescription(`[${res.playlist.title}](${query})`)
        .addFields(
          {
            name: lang.enqueued,
            value: `\`${res.tracks.length}\` ${lang.songs}`,
            inline: true,
          },
          {
            name: lang.playlist_duration,
            value: `\`${client.ms(res.playlist.duration, {
              colonNotation: true,
              secondsDecimalDigits: 0,
            })}\``,
            inline: true,
          },
        );

      await interaction
        .editReply({
          embeds: [
            playlistEmbed,
          ],
        })
        .catch(this.warn);
    }

    if (ret) setTimeout(() => ret.delete().catch(this.warn), 10000);
    return ret;
  });

module.exports = command;
