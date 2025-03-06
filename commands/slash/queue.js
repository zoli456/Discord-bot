const SlashCommand = require("../../lib/SlashCommand");
const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  escapeMarkdown,
  ButtonStyle,
  InteractionContextType,
  MessageFlags,
} = require("discord.js");
const load = require("lodash");
const pms = require("pretty-ms");

const command = new SlashCommand()
  .setName("queue")
  .setDescription("Shows the current queue")
  .setNameLocalizations({
    hu: "várólista",
  })
  .setDescriptionLocalizations({
    hu: "Kiíratja a teljes várólistát.",
  })
  .setContexts(InteractionContextType.Guild)
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
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.no_songs_in_queue),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!player.playing) {
      const queueEmbed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setDescription(lang.nothing_playing);
      return interaction.reply({
        embeds: [
          queueEmbed,
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply().catch(() => {});

    if (!player.queue.tracks || player.queue.tracks.length === 0) {
      var title = escapeMarkdown(player.queue.current.info.title);
      var title = title.replace(/\]/g, "");
      var title = title.replace(/\[/g, "");
      const queueEmbed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setDescription(`**♪ | ${lang.now_playing}:** [${title}](${player.queue.current.info.uri})`)
        .addFields(
          {
            name: lang.duration,
            value: player.queue.current.info.isStream
              ? lang.LIVE
              : `\`${pms(player.position, { colonNotation: true })} / ${pms(
                  player.queue.current.info.duration,
                  { colonNotation: true },
                )}\``,
            inline: true,
          },
          {
            name: lang.volume,
            value: `\`${player.volume}\``,
            inline: true,
          },
          {
            name: lang.total_tracks,
            value: `\`${player.queue.tracks.length}\``,
            colonNotation: true,
            inline: true,
          },
        );

      await interaction.editReply({
        embeds: [
          queueEmbed,
        ],
      });
    } else {
      let queueDuration = player.queue.utils.totalDuration();
      if (player.queue.current.info.isStream) {
        queueDuration -= player.queue.current.info.duration;
      }
      for (let i = 0; i < player.queue.tracks.length; i++) {
        if (player.queue.tracks[i].isStream) {
          queueDuration -= player.queue.tracks[i].info.duration;
        }
      }

      const mapping = player.queue.tracks.map(
        (t, i) => `\` ${++i} \` [${t.info.title}](${t.info.uri}) [${t.requester}]`,
      );

      const chunk = load.chunk(mapping, 10);
      const pages = chunk.map((s) => s.join("\n"));
      let page = interaction.options.getNumber("page");
      if (!page) {
        page = 0;
      }
      if (page) {
        page = page - 1;
      }
      if (page > pages.length) {
        page = 0;
      }
      if (page < 0) {
        page = 0;
      }

      if (player.queue.tracks.size < 11 || player.queue.tracks.length < 11) {
        var title = escapeMarkdown(player.queue.current.info.title);
        var title = title.replace(/\]/g, "");
        var title = title.replace(/\[/g, "");
        const embedTwo = new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setDescription(
            `**♪ | ${lang.now_playing}:** [${title}](${player.queue.current.info.uri}) [${player.queue.current.requester}]\n\n**${lang.queued_tracks}**\n${pages[page]}`,
          )
          .addFields(
            {
              name: lang.track_duration,
              value: player.queue.current.isStream
                ? lang.LIVE
                : `\`${pms(player.position, { colonNotation: true })} / ${pms(
                    player.queue.current.info.duration,
                    { colonNotation: true },
                  )}\``,
              inline: true,
            },
            {
              name: lang.total_tracks_duration,
              value: `\`${pms(queueDuration, {
                colonNotation: true,
              })}\``,
              inline: true,
            },
            {
              name: lang.total_tracks,
              value: `\`${player.queue.tracks.length}\``,
              colonNotation: true,
              inline: true,
            },
          )
          .setFooter({
            text: `${lang.page} ${page + 1}/${pages.length}`,
          });

        await interaction
          .editReply({
            embeds: [
              embedTwo,
            ],
          })
          .catch(() => {});
      } else {
        var title = escapeMarkdown(player.queue.current.info.title);
        var title = title.replace(/\]/g, "");
        var title = title.replace(/\[/g, "");
        const embedThree = new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setDescription(
            `**♪ | ${lang.now_playing}:** [${title}](${player.queue.current.info.uri}) [${player.queue.current.requester}]\n\n**${lang.queued_tracks}**\n${pages[page]}`,
          )
          .addFields(
            {
              name: lang.track_duration,
              value: player.queue.current.isStream
                ? lang.LIVE
                : `\`${pms(player.position, { colonNotation: true })} / ${pms(
                    player.queue.current.info.duration,
                    { colonNotation: true },
                  )}\``,
              inline: true,
            },
            {
              name: lang.total_tracks_duration,
              value: `\`${pms(queueDuration, {
                colonNotation: true,
              })}\``,
              inline: true,
            },
            {
              name: lang.total_tracks,
              value: `\`${player.queue.tracks.length}\``,
              colonNotation: true,
              inline: true,
            },
          )
          .setFooter({
            text: `${lang.page} ${page + 1}/${pages.length}`,
          });

        const buttonOne = new ButtonBuilder()
          .setCustomId("queue_cmd_but_1_app")
          .setEmoji("⏭️")
          .setStyle(ButtonStyle.Primary);
        const buttonTwo = new ButtonBuilder()
          .setCustomId("queue_cmd_but_2_app")
          .setEmoji("⏮️")
          .setStyle(ButtonStyle.Primary);

        await interaction
          .editReply({
            embeds: [
              embedThree,
            ],
            components: [
              new ActionRowBuilder().addComponents([
                buttonTwo, buttonOne,
              ]),
            ],
          })
          .catch(() => {});

        const collector = interaction.channel.createMessageComponentCollector({
          filter: (b) => {
            if (b.user.id === interaction.user.id) {
              return true;
            } else {
              return b
                .reply({
                  content: `${lang.queue1} **${interaction.user.tag}** ${lang.queue2}`,
                  flags: MessageFlags.Ephemeral,
                })
                .catch(() => {});
            }
          },
          time: 60000 * 5,
          idle: 30000,
        });

        collector.on("collect", async (button) => {
          if (button.customId === "queue_cmd_but_1_app") {
            await button.deferUpdate().catch(() => {});
            page = page + 1 < pages.length ? ++page : 0;
            var title = escapeMarkdown(player.queue.current.info.title);
            var title = title.replace(/\]/g, "");
            var title = title.replace(/\[/g, "");
            const embedFour = new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(
                `**♪ | ${lang.now_playing}:** [${title}](${player.queue.current.info.uri}) [${player.queue.current.requester}]\n\n**${lang.queued_tracks}**\n${pages[page]}`,
              )
              .addFields(
                {
                  name: lang.track_duration,
                  value: player.queue.current.info.isStream
                    ? lang.LIVE
                    : `\`${pms(player.position, {
                        colonNotation: true,
                      })} / ${pms(player.queue.current.info.duration, {
                        colonNotation: true,
                      })}\``,
                  inline: true,
                },
                {
                  name: lang.total_tracks_duration,
                  value: `\`${pms(queueDuration, {
                    colonNotation: true,
                  })}\``,
                  inline: true,
                },
                {
                  name: lang.total_tracks,
                  value: `\`${player.queue.tracks.length}\``,
                  colonNotation: true,
                  inline: true,
                },
              )
              .setFooter({
                text: `${lang.page} ${page + 1}/${pages.length}`,
              });

            await interaction.editReply({
              embeds: [
                embedFour,
              ],
              components: [
                new ActionRowBuilder().addComponents([
                  buttonTwo, buttonOne,
                ]),
              ],
            });
          } else if (button.customId === "queue_cmd_but_2_app") {
            await button.deferUpdate().catch(() => {});
            page = page > 0 ? --page : pages.length - 1;
            var title = escapeMarkdown(player.queue.current.info.title);
            var title = title.replace(/\]/g, "");
            var title = title.replace(/\[/g, "");
            const embedFive = new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(
                `**♪ | ${lang.now_playing}:** [${title}](${player.queue.current.info.uri}) [${player.queue.current.requester}]\n\n**{${lang.queued_tracks}}**\n${pages[page]}`,
              )
              .addFields(
                {
                  name: lang.track_duration,
                  value: player.queue.current.info.isStream
                    ? lang.LIVE
                    : `\`${pms(player.position, {
                        colonNotation: true,
                      })} / ${pms(player.queue.current.info.duration, {
                        colonNotation: true,
                      })}\``,
                  inline: true,
                },
                {
                  name: lang.total_tracks_duration,
                  value: `\`${pms(queueDuration, {
                    colonNotation: true,
                  })}\``,
                  inline: true,
                },
                {
                  name: lang.total_tracks,
                  value: `\`${player.queue.tracks.length}\``,
                  colonNotation: true,
                  inline: true,
                },
              )
              .setFooter({
                text: `${lang.page} ${page + 1}/${pages.length}`,
              });

            await interaction
              .editReply({
                embeds: [
                  embedFive,
                ],
                components: [
                  new ActionRowBuilder().addComponents([
                    buttonTwo, buttonOne,
                  ]),
                ],
              })
              .catch(() => {});
          } else {
            return;
          }
        });
        collector.on("end", async (iter) => {
          await interaction.editReply({
            content: null,
            embeds: [
              new EmbedBuilder().setDescription(lang.time_is_up).setColor(client.config.embedColor),
            ],
            components: [],
            flags: MessageFlags.Ephemeral,
          });
          setTimeout(() => interaction.deleteReply(), 30000);
        });
      }
    }
  });

module.exports = command;
