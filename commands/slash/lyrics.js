import SlashCommand from "../../lib/SlashCommand.js";

import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  InteractionContextType,
} from "discord.js";

import Genius from "genius-lyrics";

const command = new SlashCommand()
  .setName("lyrics")
  .setDescription("Get the lyrics of a song")
  .setNameLocalizations({
    hu: "dalszöveg",
  })
  .setDescriptionLocalizations({
    hu: "Kiírja egy dalnak a szövegét.",
  })
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option) =>
    option
      .setName("song")
      .setDescription("The song to get lyrics for")
      .setNameLocalizations({
        hu: "dal",
      })
      .setDescriptionLocalizations({
        hu: "Melyik dalt keresed pontosan?",
      })
      .setRequired(false),
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

    await interaction.reply({
      embeds: [
        new EmbedBuilder().setColor(client.config.embedColor).setDescription(lang.searching),
      ],
    });

    let player;
    if (client.manager) {
      player = client.manager.getPlayer(interaction.guild.id);
    } else {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.lavalink_not_connected),
        ],
      });
    }

    const args = interaction.options.getString("song");
    if (!args && !player) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.nothing_playing),
        ],
      });
    }
    const Client = new Genius.Client(process.env.LYRICS_API_KEY);
    let currentTitle = ``;

    if (!args) {
      currentTitle = player.queue.current.info.title;
    }
    let query = args ? args : currentTitle;
    let lyricsResults = [];

    await Client.songs
      .search(query)
      .then(async (lyricsData) => {
        if (lyricsData.length !== 0) {
          for (let i = 0; i < client.config.lyricsMaxResults; i++) {
            if (lyricsData[i]) {
              lyricsResults.push({
                label: `${lyricsData[i].title}`,
                description: `${lyricsData[i].artist.name}`,
                value: i.toString(),
              });
            } else {
              break;
            }
          }

          const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId("choose-lyrics")
              .setPlaceholder(lang.choose_a_song)
              .addOptions(lyricsResults),
          );

          let selectedLyrics = await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription(`${lang.lyrics1} \`${query}\`. ${lang.lyrics2}`),
            ],
            components: [
              menu,
            ],
          });

          const filter = (button) => button.user.id === interaction.user.id;

          const collector = selectedLyrics.createMessageComponentCollector({
            filter,
            time: 30000,
          });

          collector.on("collect", async (interaction) => {
            if (interaction.isStringSelectMenu()) {
              await interaction.deferUpdate();
              const lyrics = lyricsData[parseInt(interaction.values[0])];

              const firstSong = lyricsData[parseInt(interaction.values[0])];
              // Ok lets get the lyrics
              let lyricsText = await firstSong.lyrics();

              const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId("tipsbutton")
                  .setLabel(lang.tips)
                  .setEmoji(`📌`)
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setLabel(lang.source)
                  .setURL(lyrics.url)
                  .setStyle(ButtonStyle.Link),
              );

              const musixmatch_icon =
                "https://static.stereogum.com/uploads/2023/06/Genius-logo-1687809314.png";
              let lyricsEmbed = new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setTitle(`${lyrics.fullTitle}`)
                .setURL(lyrics.url)
                .setThumbnail(lyrics.thumbnail)
                .setFooter({
                  text: lang.lyrics_provided,
                  iconURL: musixmatch_icon,
                })
                .setDescription(lyricsText);

              if (lyricsText.length === 0) {
                lyricsEmbed.setDescription(lang.not_authorized).setFooter({
                  text: lang.resricted_lyrics,
                  iconURL: musixmatch_icon,
                });
              }

              if (lyricsText.length > 4096) {
                lyricsText = lyricsText.substring(0, 4050) + "\n\n[...]";
                lyricsEmbed.setDescription(lyricsText + lang.truncated_lyrics);
              }

              return interaction.editReply({
                embeds: [
                  lyricsEmbed,
                ],
                components: [
                  button,
                ],
              });
            }
          });

          collector.on("end", async (i) => {
            if (i.size == 0) {
              selectedLyrics.edit({
                content: null,
                embeds: [
                  new EmbedBuilder()
                    .setDescription(lang.no_track_lyrics)
                    .setColor(client.config.embedColor),
                ],
                components: [],
              });
            }
            setTimeout(() => interaction.deleteReply(), 300000);
          });
        } else {
          const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setEmoji(`📌`)
              .setCustomId("tipsbutton")
              .setLabel(lang.tips)
              .setStyle(ButtonStyle.Secondary),
          );
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`${lang.no_result_for1} \`${query}\`!${lang.no_result_for2}`),
            ],
            components: [
              button,
            ],
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return interaction.editReply({
          embeds: [
            new EmbedBuilder().setColor("#FF0000").setDescription(lang.lyrics_error),
          ],
        });
      });

    const collector = interaction.channel.createMessageComponentCollector({
      time: 1000 * 3600,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "tipsbutton") {
        await interaction.deferUpdate();
        await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setTitle(lang.lyrics_tips_title)
              .setColor(client.config.embedColor)
              .setDescription(lang.lyrics_tips),
          ],
          flags: MessageFlags.Ephemeral,
          components: [],
        });
      }
    });
  });

export default command;
