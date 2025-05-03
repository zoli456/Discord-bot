import SlashCommand from "../../lib/SlashCommand.js";
import {
  EmbedBuilder,
  InteractionContextType,
  ChannelType,
  MessageFlags,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import prettyMilliseconds from "pretty-ms";

const command = new SlashCommand()
  .setName("search")
  .setDescription("Search for a song")
  .setNameLocalizations({
    hu: "keresés",
  })
  .setDescriptionLocalizations({
    hu: "Rákereshetsz egy címre egy oldalon.",
  })
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option) =>
    option
      .setName("query")
      .setDescription("The song to search for")
      .setNameLocalizations({
        hu: "cím",
      })
      .setDescriptionLocalizations({
        hu: "A dal címe amit keresel.",
      })
      .setRequired(true),
  )
  .addStringOption((option2) =>
    option2
      .setName("site")
      .setDescription("Where should I search?")
      .setRequired(true)
      .setNameLocalizations({
        hu: "oldal",
      })
      .setDescriptionLocalizations({
        hu: "Melyik oldalon keressem?",
      })
      .addChoices(
        { name: "Youtube", value: "ytsearch" },
        { name: "Youtube Music", value: "ytmsearch" },
        { name: "Spotify", value: "spsearch" },
        { name: "Deezer", value: "dzsearch" },
        { name: "Soundcloud", value: "soundcloud" },
        { name: "Bandcamp", value: "bandcamp" },
        { name: "Cornhub", value: "phsearch" },
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
    if (interaction.options.getString("site") === "phsearch" && !interaction.channel.nsfw) {
      return interaction
        .reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, lang.play_nsfw_channel),
          ],
          flags: MessageFlags.Ephemeral,
        })
        .then((msg) => setTimeout(() => msg.delete(), 20000));
    }
    let channel = await client.getChannel(client, interaction);
    if (!channel) {
      return;
    }
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

    await interaction.deferReply().catch((_) => {});

    const query = interaction.options.getString("query").trim();
    const location = interaction.options.getString("site");

    let res;
    try {
      res = await player.search({ query, source: location }, interaction.user);
      if (res.loadType === "error") {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(lang.searching_error).setColor("#FF0000"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (err) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: lang.searching_error,
            })
            .setColor("#FF0000"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (res.loadType === "empty") {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${lang.no_results_for} \`${query}\``)
            .setColor("#FF0000"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } else {
      let max = 10;
      if (res.tracks.length < max) {
        max = res.tracks.length;
      }

      let resultFromSearch = [];

      res.tracks.slice(0, max).map((track) => {
        if (resultFromSearch.every((x) => x.value !== track.info.uri)) {
          resultFromSearch.push({
            label: `${track.info.title.substring(0, 100)}`,
            value: `${track.info.uri}`,
            description: track.info.isStream
              ? lang.LIVE
              : `${prettyMilliseconds(track.info.duration, {
                  secondsDecimalDigits: 0,
                })} - ${track.info.author}`,
          });
        }
      });
      const menus = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("select")
          .setPlaceholder(lang.select_a_song)
          .addOptions(resultFromSearch),
      );

      let choosenTracks = await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription(`${lang.choose_a_track1} \`${query}\`. ${lang.choose_a_track2}`),
        ],
        components: [
          menus,
        ],
        flags: MessageFlags.Ephemeral,
      });
      const filter = (button) => button.user.id === interaction.user.id;

      const tracksCollector = choosenTracks.createMessageComponentCollector({
        filter,
        time: 60000,
      });
      tracksCollector.on("collect", async (i) => {
        if (i.isStringSelectMenu()) {
          await i.deferUpdate();

          if (player.state !== "CONNECTED") {
            await player.connect();
          }
          let uriFromCollector = i.values[0];
          let trackForPlay;

          trackForPlay = await player?.search(uriFromCollector, interaction.user);
          player?.queue?.add(trackForPlay.tracks[0]);
          if (!player?.playing && !player?.paused && !player?.queue?.tracks?.size) {
            player?.play();
          }
          const embed = new EmbedBuilder()
            .setAuthor({
              name: lang.added_to_queue,
              iconURL: client.config.iconURL,
            })
            .setURL(res.tracks[0].info.uri)
            .setThumbnail(res.tracks[0].info.artworkUrl)
            .setDescription(
              `[${trackForPlay?.tracks[0]?.info?.title}](${trackForPlay?.tracks[0]?.info.uri})` ||
                lang.no_title,
            )
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
                  : `\`${prettyMilliseconds(res.tracks[0].info.duration, {
                      colonNotation: true,
                    })}\``,
                inline: true,
              },
            )
            .setColor(client.config.embedColor);
          if (player?.queue?.tracks?.length > 0) {
            embed.addFields({
              name: lang.position_in_queue,
              value: `${player.queue.tracks.length}`,
              inline: true,
            });
          }
          i.editReply({
            content: null,
            embeds: [
              embed,
            ],
            components: [],
          }).then((msg) => {
            setTimeout(() => msg.delete(), 10000);
          });
        }
      });
      tracksCollector.on("end", async (i) => {
        if (i.size === 0) {
          await choosenTracks.edit({
            content: null,
            embeds: [
              new EmbedBuilder()
                .setDescription(lang.no_track_selected)
                .setColor(client.config.embedColor),
            ],
            components: [],
            flags: MessageFlags.Ephemeral,
          });
          setTimeout(() => interaction.deleteReply(), 30000);
        }
      });
    }
  });

export default command;
