const { AuditLogEvent, EmbedBuilder } = require("discord.js");

module.exports = async (client, role) => {
  const guildSettings = client.guild_settings.find((e) => e.guildId === role.guild.id);
  if (await guildSettings.settings_db.exists("/log_channel")) {
    const log_settings = await guildSettings.settings_db.getData("/log_channel");
    const lang = client.localization_manager.getLanguage(
      await guildSettings.settings_db.getData("/language"),
    );
    const logChannel = client.channels.cache.get(log_settings.log_channel_id);
    const fetchedLogs1 = await role.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.RoleDelete,
    });
    const roleLog = fetchedLogs1.entries.first();
    if (roleLog && roleLog.targetId === role.id) {
      //if (roleLog.createdTimestamp > Date.now() - 1000) {
      logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#FFA500")
            .setAuthor({
              name: roleLog.executor.tag,
              iconURL: roleLog.executor.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(lang.log_role_deleted1.replace("{u}", `<@${roleLog.executorId}>`))
            .addFields({
              name: lang.name_title,
              value: `${role.name}`,
            })
            .setTimestamp()
            .setFooter({
              text: role.guild.name,
              iconURL: role.guild.iconURL(),
            }),
        ],
      });
      //  }
    } else {
      logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#FFA500")
            .setDescription(lang.log_role_deleted2)
            .addFields({
              name: lang.name_title,
              value: `${role.name}`,
            })
            .setTimestamp()
            .setFooter({
              text: role.guild.name,
              iconURL: role.guild.iconURL(),
            }),
        ],
      });
    }
  }
};
