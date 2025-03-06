const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder, InteractionContextType, ChannelType, escapeMarkdown } = require("discord.js");

const command = new SlashCommand()
  .setName("play")
  .setDescription("Searches and plays the requested song.")
  .setNameLocalizations({
    hu: "lejátszás",
  })
  .setDescriptionLocalizations({
    hu: "Megkeresi és lejátsza a kért dalt.",
  })
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option) =>
    option
      .setName("query")
      .setDescription("What am I looking for?")
      .setAutocomplete(true)
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(512)
      .setNameLocalizations({
        hu: "cím_link",
      })
      .setDescriptionLocalizations({
        hu: "Írd be a címet vagy a pontos linkjét a dalnak vagy lejátszási listának!",
      }),
  )
  .addStringOption((option2) =>
    option2
      .setName("sponsor_blocker")
      .setDescription("Should I skip the sponsored segments?")
      .setAutocomplete(false)
      .setRequired(false)
      .addChoices({ name: "Yes", value: "true" }, { name: "No", value: "false" })
      .setNameLocalizations({
        hu: "sponzor_szűrő",
      })
      .setDescriptionLocalizations({
        hu: "Kihagyjam a sponzorációs részeket a videókból?",
      }),
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
        `${interaction.guild.name}(${interaction.guildId}) | User hit the rate limit on the player: ${interaction.user.username}(${interaction.member.id}).`,
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

    let query = options.getString("query", true).trim();

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

    let player = client.manager.getPlayer(interaction.guildId);
    /* if (player && !player.queue.current) {
        await player.destroy();
    }*/
    try {
      player = client.createPlayer(interaction.channel, channel);
    } catch (error) {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.lavalink_not_connected),
        ],
        flags: MessageFlags.Ephemeral,
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
      await player.destroy();
      return;
    }

    let sponsor_blocker = options.getString("sponsor_blocker", false);
    if (sponsor_blocker) {
      if (sponsor_blocker === "true") player.setSponsorBlock();
      else {
        player.deleteSponsorBlock();
      }
    }
    let res = await player.search(query, interaction.user).catch((err) => {
      client.error(err);
      return {
        loadType: "error",
      };
    });

    if (res.loadType === "error") {
      if (!player.queue.current) {
        await player.destroy();
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
        await player.destroy();
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
            value: `\`${client.ms(player.queue.utils.totalDuration(), {
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
