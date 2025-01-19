const { EmbedBuilder, AuditLogEvent } = require("discord.js");

module.exports = async (client, ban) => {
  const guildSettings = client.guild_settings.find(
    (e) => e.guildId === ban.guild.id,
  );
  if (await guildSettings.settings_db.exists("/log_channel")) {
    const log_settings =
      await guildSettings.settings_db.getData("/log_channel");
    const lang = client.localization_manager.getLanguage(
      await guildSettings.settings_db.getData("/language"),
    );
    const logChannel = client.channels.cache.get(log_settings.log_channel_id);
    const fetchedLogs1 = await ban.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanRemove,
    });
    const banLog = fetchedLogs1.entries.first();
    if (banLog.createdTimestamp < Date.now() - 1000) {
      return;
    }
    logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#FFA500")
          .setAuthor({
            name: banLog.executor.tag,
            iconURL: banLog.executor.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(
            lang.log_ban_removed.replace("{u}", `<@${banLog.executorId}>`),
          )
          .addFields({
            name: "Célpont:",
            value: `<@${ban.user.id}>\n<@${ban.user.id}>`,
          })
          .setTimestamp()
          .setFooter({
            text: ban.guild.name,
            iconURL: ban.guild.iconURL(),
          }),
      ],
    });
  }
};
