const {
  ContextMenuCommandBuilder,
  escapeMarkdown,
  ChannelType,
  ApplicationCommandType,
  InteractionContextType,
} = require("discord.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  command: new ContextMenuCommandBuilder()
    .setName("Play Song")
    .setNameLocalizations({
      hu: "Lejátszás",
    })
    .setType(ApplicationCommandType.Message)
    .setContexts(InteractionContextType.Guild),

  /**
   * This function will handle context menu interaction
   * @param {import("../lib/DiscordMusicBot")} client
   * @param {import("discord.js").GuildContextMenuInteraction} interaction
   */
  run: async (client, interaction, options) => {
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

    /*let node = await client.getLavalink(client);
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

    const query =
      interaction.channel.messages.cache.get(interaction.targetId).content ??
      (await interaction.channel.messages.fetch(interaction.targetId));

    if (query.includes("pornhub.com") && !interaction.channel.nsfw) {
      return interaction
        .reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, lang.play_nsfw_channel),
          ],
          flags: MessageFlags.Ephemeral,
        })
        .then((msg) => setTimeout(() => msg.delete(), 20000));
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
          new EmbedBuilder().setColor(client.config.embedColor).setDescription(lang.searching),
        ],
      });
    } catch (e) {
      player.destroy();
      return;
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
      player.queue.add(res.tracks[0]);

      if (!player?.playing && !player?.paused) {
        await player.play();
      }

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
            name: lang.uploader,
            value: res.tracks[0].info.author,
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
        //  player.queue.previous = player.queue.current;
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
        .setThumbnail(res.tracks[0].info.artworkUrl)
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
  },
};
