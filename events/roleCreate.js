const { EmbedBuilder, AuditLogEvent } = require("discord.js");

module.exports = async (client, role) => {
  const guildSettings = client.guild_settings.find(
    (e) => e.guildId === role.guild.id,
  );

  if (await guildSettings.settings_db.exists("/log_channel")) {
    const [log_settings, languageSetting] = await Promise.all([
      guildSettings.settings_db.getData("/log_channel"),
      guildSettings.settings_db.getData("/language"),
    ]);

    const lang = client.localization_manager.getLanguage(languageSetting);
    const logChannel = client.channels.cache.get(log_settings.log_channel_id);

    const fetchedLogs1 = await role.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.RoleCreate,
    });

    const roleLog = fetchedLogs1.entries.first();

    const embed = new EmbedBuilder()
      .setColor("#FFA500")
      .addFields({
        name: lang.name_title,
        value: `${role.name}`,
      })
      .setTimestamp()
      .setFooter({
        text: role.guild.name,
        iconURL: role.guild.iconURL(),
      });

    if (roleLog && roleLog.targetId === role.id) {
      embed
        .setAuthor({
          name: roleLog.executor.tag,
          iconURL: roleLog.executor.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          lang.log_role_created1.replace("{u}", `<@${roleLog.executorId}>`),
        );
    } else {
      embed.setDescription(lang.log_role_crated2);
    }

    logChannel.send({ embeds: [embed] });
  }
};
