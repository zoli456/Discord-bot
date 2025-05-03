import { EmbedBuilder, AuditLogEvent } from 'discord.js';

/**
 *
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {import("discord.js").VoiceState} oldState
 * @param {import("discord.js").VoiceState} newState
 * @returns {Promise<void>}
 */
export default async (client, oldState, newState) => {
  const guildId = newState.guild.id;
  const guildSettings = client.guild_settings.find((e) => e.guildId === guildId);
  const settingsDb = await guildSettings.settings_db.getData("/");
  const lang = client.localization_manager.getLanguage(settingsDb.language);

  const logChannel = settingsDb.log_channel
    ? client.channels.cache.get(settingsDb.log_channel.log_channel_id)
    : null;

  const sendEmbed = async (channel, embed) => {
    if (channel) {
      await channel.send({
        embeds: [
          embed,
        ],
      });
    }
  };

  const fetchAuditLog = async (guild, type) => {
    const fetchedLogs = await guild.fetchAuditLogs({ limit: 1, type });
    return fetchedLogs.entries.first();
  };

  const createEmbed = (color, author, description, footer, fields = []) =>
    new EmbedBuilder()
      .setColor(color)
      .setAuthor(author)
      .setDescription(description)
      .addFields(fields)
      .setTimestamp()
      .setFooter(footer);

  if (logChannel) {
    const author = {
      name: oldState.member.user.tag,
      iconURL: oldState.member.user.displayAvatarURL({ dynamic: true }),
    };
    const footer = {
      text: oldState.member.guild.name,
      iconURL: newState.guild.iconURL(),
    };

    if (!oldState.channelId && newState.channelId) {
      const description = lang.log_voice_join
        .replace("{u}", `<@${oldState.member.id}>`)
        .replace("{c}", `\`${newState.channel.name}\``);

      const embed = createEmbed("#0099ff", author, description, footer);
      await sendEmbed(logChannel, embed);
    }

    if (oldState.channelId && !newState.channelId && oldState.member.id) {
      const disconnectLog = await fetchAuditLog(
        oldState.member.guild,
        AuditLogEvent.MemberDisconnect,
      );
      let description;
      let fields = [];
      if (disconnectLog && disconnectLog.createdTimestamp > Date.now() - 1000) {
        description = `${lang.log_disconnected1.replace("{u}", `<@${oldState.member.id}>`)} ${oldState.channel ? lang.log_disconnected2.replace("{c}", `\`${oldState.channel.name}\``) : lang.log_a} ${lang.from_channel}`;
        fields = disconnectLog
          ? [
              {
                name: lang.responsible_moderator,
                value: `<@${disconnectLog.executor.id}>`,
                inline: true,
              }, {
                name: lang.reason,
                value: disconnectLog.reason || lang.no_reason_given,
                inline: true,
              },
            ]
          : [];
      } else {
        description = `${lang.log_left_channel.replace("{u}", `<@${oldState.member.id}>`)} ${oldState.channel ? lang.log_disconnected2.replace("{c}", `\`${oldState.channel.name}\``) : lang.log_a} ${lang.from_channel}`;
      }
      const embed = createEmbed("#0099ff", author, description, footer, fields);
      await sendEmbed(logChannel, embed);
    }

    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      const moveLog = await fetchAuditLog(oldState.member.guild, AuditLogEvent.MemberMove);
      let description;
      let fields;
      if (moveLog && moveLog.createdTimestamp > Date.now() - 1000) {
        description = `${lang.log_user_moved.replace("{u}", `<@${oldState.member.id}>`)} ${oldState.channel ? `\`${oldState.channel.name}\`` : lang.temporary_channel} :arrow_right: \`${newState.channel.name}\`.`;
        fields = moveLog
          ? [
              {
                name: lang.responsible_moderator,
                value: `<@${moveLog.executor.id}>`,
              },
            ]
          : [];
      } else {
        description = `${lang.log_changed_channel.replace("{u}", `<@${oldState.member.id}>`)} \`${oldState.channel ? oldState.channel.name : lang.temporary_channel}\` :arrow_right: \`${newState.channel.name}\`.`;
      }
      const embed = createEmbed("#0099ff", author, description, footer, fields);
      await sendEmbed(logChannel, embed);
    }

    const handleMuteDeaf = async (type, logType, stateKey, langKey) => {
      const log = await fetchAuditLog(oldState.member.guild, logType);
      const description = lang.log_voice_state_update.replace("{u}", `<@${oldState.member.id}>`);
      const fields = [
        {
          name: langKey,
          value: newState[stateKey] ? ":white_check_mark:" : ":x:",
          inline: true,
        }, log
          ? {
              name: lang.responsible_moderator,
              value: `<@${log.executor.id}>`,
              inline: true,
            }
          : null,
      ].filter(Boolean);

      const embed = createEmbed("#880808", author, description, footer, fields);
      await sendEmbed(logChannel, embed);
    };

    if (oldState.serverMute !== newState.serverMute && oldState.channelId) {
      await handleMuteDeaf(
        "serverMute",
        AuditLogEvent.MemberUpdate,
        "serverMute",
        lang.server_mute,
      );
    }

    if (oldState.serverDeaf !== newState.serverDeaf && oldState.channelId) {
      await handleMuteDeaf(
        "serverDeaf",
        AuditLogEvent.MemberUpdate,
        "serverDeaf",
        lang.server_deafen,
      );
    }
  }

  if (settingsDb.temp_channel) {
    if (!oldState.channel && newState.channel) {
      await client.tempChannelsmanager.createNewChild(newState.member, newState.channel);
    } else if (oldState.channel && newState.channel) {
      await client.tempChannelsmanager.handleChild(
        newState.member,
        oldState.channel,
        newState.channel,
      );
    } else if (oldState.channel && !newState.channel) {
      await client.tempChannelsmanager.checkChildForDeletion(oldState.channel);
    }
  }

  const player = client.manager.getPlayer(guildId);
  if (!player || !player.connected) return;

  const stateChange = {};
  if (!oldState.channel && newState.channel) {
    stateChange.type = "JOIN";
    stateChange.channel = newState.channel;
  } else if (oldState.channel && !newState.channel) {
    stateChange.type = "LEAVE";
    stateChange.channel = oldState.channel;
  } else if (oldState.channel && newState.channel && oldState.channelId !== newState.channelId) {
    stateChange.type = newState.channel.id === player.voiceChannelId ? "JOIN" : "LEAVE";
    stateChange.channel =
      newState.channel.id === player.voiceChannelId ? newState.channel : oldState.channel;
  }
  if (!stateChange.channel || stateChange.channel.id !== player.voiceChannelId) return;
  /* player.prevMembers = player.members;
    player.members = stateChange.channel.members.filter(
      (member) => !member.user.bot,
    ).size;*/
  switch (stateChange.type) {
    case "JOIN":
      if (player.get("autoPause") === true) {
        let members = stateChange.channel.members.filter((member) => !member.user.bot).size;
        if (members === 1 && player.paused /*&& members !== player.prevMembers*/) {
          player.resume();
          let playerResumed = new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setTitle(lang.resumed, client.config.iconURL)
            .setDescription(
              `${lang.playing}  [${player.queue.current.info.title}](${player.queue.current.info.uri})`,
            )
            .setFooter({ text: lang.resumed_song });

          let resumeMessage = await client.channels.cache.get(player.textChannelId).send({
            embeds: [
              playerResumed,
            ],
          });
          try {
            player.pausedMessage.delete();
            player.pausedMessage = null;
          } catch (e) {}

          setTimeout(() => {
            try {
              resumeMessage.delete();
            } catch (e) {}
          }, 5000);
        }
      }
      break;
    case "LEAVE":
      let members = stateChange.channel.members.filter((member) => !member.user.bot).size;
      const twentyFourSeven = player.get("twentyFourSeven");
      if (player.get("autoPause") === true && player.get("autoLeave") === false) {
        if (members === 0 && !player.paused && player.playing) {
          player.pause();

          let playerPaused = new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setTitle(lang.paused_title, client.config.iconURL)
            .setDescription(lang.song_paused);

          let pausedMessage = await client.channels.cache.get(player.textChannelId).send({
            embeds: [
              playerPaused,
            ],
          });
          player.pausedMessage = pausedMessage;
        }
      } else if (player.get("autoLeave") === true && player.get("autoPause") === false) {
        if (members === 0) {
          if (twentyFourSeven) {
            setTimeout(async () => {
              let members = stateChange.channel.members.filter((member) => !member.user.bot).size;
              if (members === 0 && player.state !== "DISCONNECTED") {
                let leftEmbed = new EmbedBuilder()
                  .setColor(client.config.embedColor)
                  .setAuthor({
                    name: lang.disconnected,
                    iconURL: client.config.iconURL,
                  })
                  .setDescription(lang.left_alone_in_channel);
                let Disconnected = await client.channels.cache.get(player.textChannelId).send({
                  embeds: [
                    leftEmbed,
                  ],
                });
                setTimeout(() => Disconnected.delete(true), 5000);
                player.queue.clear();
                player.destroy();
                player.set("autoQueue", false);
              }
            }, client.config.disconnectTime);
          } else {
            let leftEmbed = new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setAuthor({
                name: lang.disconnected,
                iconURL: client.config.iconURL,
              })
              .setDescription(lang.left_alone_in_channel);
            let Disconnected = await client.channels.cache.get(player.textChannelId).send({
              embeds: [
                leftEmbed,
              ],
            });
            setTimeout(() => Disconnected.delete(true), 5000);
            player.destroy();
          }
        }
      } else if (player.get("autoLeave") === true && player.get("autoPause") === true) {
        if (members === 0 && !player.paused && player.playing && twentyFourSeven) {
          player.pause();

          let playerPaused = new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setTitle(lang.paused_title, client.config.iconURL)
            .setDescription(lang.song_paused);

          let pausedMessage = await client.channels.cache.get(player.textChannelId).send({
            embeds: [
              playerPaused,
            ],
          });
          player.setPausedMessage(pausedMessage);
          setTimeout(async () => {
            var members = stateChange.channel.members.filter((member) => !member.user.bot).size;
            if (members === 0 && player.state !== "DISCONNECTED") {
              let leftEmbed = new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setAuthor({
                  name: lang.disconnected,
                  iconURL: client.config.iconURL,
                })
                .setDescription(lang.left_alone_in_channel);
              let Disconnected = await client.channels.cache.get(player.textChannelId).send({
                embeds: [
                  leftEmbed,
                ],
              });
              setTimeout(() => Disconnected.delete(true), 5000);
              pausedMessage.delete(true);
              player.queue.clear();
              player.destroy();
              player.set("autoQueue", false);
            }
          }, client.config.disconnectTime);
        } else {
          if (members === 0 && player.state !== "DISCONNECTED") {
            let leftEmbed = new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setAuthor({
                name: lang.disconnected,
                iconURL: client.config.iconURL,
              })
              .setDescription(lang.left_alone_in_channel);
            let Disconnected = await client.channels.cache.get(player.textChannelId).send({
              embeds: [
                leftEmbed,
              ],
            });
            setTimeout(() => Disconnected.delete(true), 5000);
            player.destroy();
          }
        }
      }
      break;
  }
};
