const { EmbedBuilder, AuditLogEvent } = require("discord.js");
module.exports = async (client, oldRole, newRole) => {
  const guildSettings = client.guild_settings.find((e) => e.guildId === oldRole.guild.id);
  if (await guildSettings.settings_db.exists("/log_channel")) {
    const log_settings = await guildSettings.settings_db.getData("/log_channel");
    const lang = client.localization_manager.getLanguage(
      await guildSettings.settings_db.getData("/language"),
    );
    const log_channel = client.channels.cache.get(log_settings.log_channel_id);
    if (oldRole.mentionable !== newRole.mentionable) {
      log_channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#ffffff")
            .setAuthor({
              name: oldRole.guild.name,
              iconURL: oldRole.guild.iconURL(),
            })
            .setDescription(lang.log_role_changed.replace("{r}", `<@&${oldRole.id}>`))
            .addFields({
              name: lang.mentionable,
              value: newRole.mentionable ? "✅" : "❌",
              inline: true,
            })
            .setTimestamp(),
        ],
      });
    }
    if (oldRole.hexColor !== newRole.hexColor) {
      log_channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(newRole.hexColor)
            .setAuthor({
              name: oldRole.guild.name,
              iconURL: oldRole.guild.iconURL(),
            })
            .setDescription(lang.log_role_changed.replace("{r}", `<@&${oldRole.id}>`))
            .addFields({
              name: lang.color,
              value: newRole.hexColor,
              inline: true,
            })
            .setTimestamp(),
        ],
      });
    }
    if (oldRole.hoist !== newRole.hoist) {
      log_channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#ffffff")
            .setAuthor({
              name: oldRole.guild.name,
              iconURL: oldRole.guild.iconURL(),
            })
            .setDescription(lang.log_role_changed.replace("{r}", `<@&${oldRole.id}>`))
            .addFields({
              name: lang.separately_visible,
              value: newRole.hoist ? "✅" : "❌",
              inline: true,
            })
            .setTimestamp(),
        ],
      });
    }
    if (oldRole.name !== newRole.name) {
      log_channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#ffffff")
            .setAuthor({
              name: oldRole.guild.name,
              iconURL: oldRole.guild.iconURL(),
            })
            .setDescription(lang.log_role_changed.replace("{r}", `<@&${oldRole.id}>`))
            .addFields(
              {
                name: lang.old_name,
                value: `${oldRole.name}`,
                inline: true,
              },
              {
                name: lang.new_name,
                value: `${newRole.name}`,
                inline: true,
              },
            )
            .setTimestamp(),
        ],
      });
    }
    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
      let output = "";
      const fetchedLogs1 = await oldRole.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.RoleUpdate,
      });
      const roleUpdateLog = fetchedLogs1.entries.first();
      if (roleUpdateLog && roleUpdateLog.targetId === oldRole.id) {
        const permissions1 = oldRole.permissions.toArray();
        const permissions2 = newRole.permissions.toArray();
        let difference = permissions2.filter((x) => !permissions1.includes(x));
        for (let a = 0; a < difference.length; a++) {
          output += "✅ " + difference[a] + "\n";
        }
        difference = permissions1.filter((x) => !permissions2.includes(x));
        for (let a = 0; a < difference.length; a++) {
          output += "❌ " + difference[a] + "\n";
        }
        if (roleUpdateLog.executor) {
          log_channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor("#ffffff")
                .setAuthor({
                  name: oldRole.guild.name,
                  iconURL: oldRole.guild.iconURL(),
                })
                .setDescription(lang.log_role_changed.replace("{r}", `<@&${oldRole.id}>`))
                .addFields(
                  {
                    name: lang.rights,
                    value: output,
                    inline: true,
                  },
                  {
                    name: lang.responsible_moderator,
                    value: `<@${roleUpdateLog.executor.id}>`,
                    inline: true,
                  },
                )
                .setTimestamp()
                .setFooter({
                  text: roleUpdateLog.executor.username,
                  iconURL: roleUpdateLog.executor.displayAvatarURL({
                    dynamic: true,
                  }),
                }),
            ],
          });
        } else {
          log_channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor("#ffffff")
                .setAuthor({
                  name: oldRole.guild.name,
                  iconURL: oldRole.guild.iconURL(),
                })
                .setDescription(lang.log_role_changed.replace("{r}", `<@&${oldRole.id}>`))
                .addFields({
                  name: lang.rights,
                  value: output,
                  inline: true,
                })
                .setTimestamp(),
            ],
          });
        }
      }
    }
  }
};
