const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { PermissionsBitField } = require("discord.js");

module.exports = async (client, oldChannel, newChannel) => {
  const guildSettings = client.guild_settings.find(
    (e) => e.guildId === oldChannel.guildId,
  );
  if (await guildSettings.settings_db.exists("/log_channel")) {
    const log_settings =
      await guildSettings.settings_db.getData("/log_channel");
    const lang = client.localization_manager.getLanguage(
      await guildSettings.settings_db.getData("/language"),
    );
    const log_channel = client.channels.cache.get(log_settings.log_channel_id);
    if (oldChannel.name !== newChannel.name) {
      const fetchedLogs1 = await oldChannel.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelUpdate,
      });
      const updateLog = fetchedLogs1.entries.first();
      if (updateLog.executor.id !== client.user.id) {
        log_channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#ffffff")
              .setAuthor({
                name: oldChannel.guild.name,
                iconURL: oldChannel.guild.iconURL(),
              })
              .setDescription(
                lang.log_channel_updated.replace("{c}", `<#${oldChannel.id}>`),
              )
              .addFields(
                {
                  name: lang.responsible_moderator,
                  value: `<@${updateLog.executor.id}>`,
                },
                {
                  name: lang.old_name,
                  value: `**${oldChannel.name}**`,
                  inline: true,
                },
                {
                  name: lang.new_name,
                  value: `**${newChannel.name}**`,
                  inline: true,
                },
              )
              .setTimestamp()
              .setFooter({
                text: updateLog.executor.username,
                iconURL: updateLog.executor.displayAvatarURL({ dynamic: true }),
              }),
          ],
        });
      }
    }
    if (oldChannel.nsfw !== newChannel.nsfw) {
      log_channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#ffffff")
            .setAuthor({
              name: oldChannel.guild.name,
              iconURL: oldChannel.guild.iconURL(),
            })
            .setDescription(
              lang.log_channel_updated.replace("{c}", `<#${oldChannel.id}>`),
            )
            .addFields({
              name: lang.age_restricted_channel,
              value: `${newChannel.nsfw ? "✅" : "❌"}`,
              inline: true,
            })
            .setTimestamp(),
        ],
      });
    }
    if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
      log_channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#ffffff")
            .setAuthor({
              name: oldChannel.guild.name,
              iconURL: oldChannel.guild.iconURL(),
            })
            .setDescription(
              lang.log_channel_updated.replace("{c}", `<#${oldChannel.id}>`),
            )
            .addFields({
              name: lang.slow_mode,
              value: `${
                newChannel.rateLimitPerUser !== 0
                  ? lang.message_per_sec.replace(
                      "{s}",
                      `\`${newChannel.rateLimitPerUser}\``,
                    )
                  : "❌"
              }`,
              inline: true,
            })
            .setTimestamp(),
        ],
      });
    }
    if (newChannel.topic && oldChannel.topic !== newChannel.topic) {
      log_channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#ffffff")
            .setAuthor({
              name: oldChannel.guild.name,
              iconURL: oldChannel.guild.iconURL(),
            })
            .setDescription(
              lang.log_channel_updated.replace("{c}", `<#${oldChannel.id}>`),
            )
            .addFields(
              {
                name: lang.previous_topic,
                value: oldChannel.topic ? oldChannel.topic : "-",
                inline: true,
              },
              {
                name: lang.new_topic,
                value: newChannel.topic ? newChannel.topic : "-",
                inline: true,
              },
            )
            .setTimestamp(),
        ],
      });
    }
    if (
      !compareOverrides(
        oldChannel.permissionOverwrites.cache,
        newChannel.permissionOverwrites.cache,
      )
    ) {
      if (
        oldChannel.permissionOverwrites.cache.size ===
        newChannel.permissionOverwrites.cache.size
      ) {
        const fetchedLogs1 = await oldChannel.guild.fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.ChannelOverwriteUpdate,
        });
        const updateLog = fetchedLogs1.entries.first();
        if (updateLog !== null) {
          if (updateLog.targetId !== oldChannel.id) return;
          let output = !updateLog.extra.joinedTimestamp
            ? `↘️<@&${updateLog.extra.id}>\n`
            : `↘️<@${updateLog.extra.id}>\n`;
          for (let i = 0; i < updateLog.changes.length; i++) {
            if (updateLog.changes[i].key === "allow") {
              const permissions1 = new PermissionsBitField(
                updateLog.changes[i].old,
              ).toArray();
              const permissions2 = new PermissionsBitField(
                updateLog.changes[i].new,
              ).toArray();
              let difference = permissions2.filter(
                (x) => !permissions1.includes(x),
              );
              for (let a = 0; a < difference.length; a++) {
                output += "✅ " + difference[a] + "\n";
              }
            }
            if (updateLog.changes[i].key === "deny") {
              const permissions1 = new PermissionsBitField(
                updateLog.changes[i].old,
              ).toArray();
              const permissions2 = new PermissionsBitField(
                updateLog.changes[i].new,
              ).toArray();
              let difference = permissions2.filter(
                (x) => !permissions1.includes(x),
              );
              for (let a = 0; a < difference.length; a++) {
                output += "❌ " + difference[a] + "\n";
              }
            }
          }
          log_channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor("#ffffff")
                .setAuthor({
                  name: oldChannel.guild.name,
                  iconURL: oldChannel.guild.iconURL(),
                })
                .setDescription(
                  lang.log_channel_updated.replace(
                    "{c}",
                    `<#${oldChannel.id}>`,
                  ),
                )
                .addFields(
                  {
                    name: lang.overrides,
                    value: output,
                    inline: true,
                  },
                  {
                    name: lang.responsible_moderator,
                    value: `<@${updateLog.executor.id}>`,
                    inline: true,
                  },
                )
                .setTimestamp()
                .setFooter({
                  text: updateLog.executor.username,
                  iconURL: updateLog.executor.displayAvatarURL({
                    dynamic: true,
                  }),
                }),
            ],
          });
        }
      }
      if (
        oldChannel.permissionOverwrites.cache.size >
        newChannel.permissionOverwrites.cache.size
      ) {
        const fetchedLogs1 = await oldChannel.guild.fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.ChannelOverwriteDelete,
        });
        const updateLog = fetchedLogs1.entries.first();
        if (updateLog !== null && updateLog && updateLog.changes) {
          if (updateLog.targetId !== oldChannel.id) return;
          for (let i = 0; i < updateLog.changes.length; i++) {
            if (updateLog.changes[i].key === "id") {
              log_channel.send({
                embeds: [
                  new EmbedBuilder()
                    .setColor("#ffffff")
                    .setAuthor({
                      name: oldChannel.guild.name,
                      iconURL: oldChannel.guild.iconURL(),
                    })
                    .setDescription(
                      lang.log_channel_updated.replace(
                        "{c}",
                        `<#${oldChannel.id}>`,
                      ),
                    )
                    .addFields(
                      {
                        name: lang.overrides,
                        value: !updateLog.extra.joinedTimestamp
                          ? `⛔<@&${updateLog.changes[i].old}>\n`
                          : `⛔<@${updateLog.changes[i].old}>\n`,
                        inline: true,
                      },
                      {
                        name: lang.responsible_moderator,
                        value: `<@${updateLog.executor.id}>`,
                        inline: true,
                      },
                    )
                    .setTimestamp()
                    .setFooter({
                      text: updateLog.executor.username,
                      iconURL: updateLog.executor.displayAvatarURL({
                        dynamic: true,
                      }),
                    }),
                ],
              });
              break;
            }
          }
        }
      }
    }
  }
};
function compareOverrides(map1, map2) {
  let testVal;
  if (map1.size !== map2.size) {
    return false;
  }
  for (let [key, val] of map1) {
    testVal = map2.get(key);
    // in cases of an undefined value, make sure the key
    // actually exists on the object so there are no false positives
    if (
      testVal.allow.bitfield !== val.allow.bitfield ||
      testVal.deny.bitfield !== val.deny.bitfield
    ) {
      return false;
    }
  }
  return true;
}
