import { EmbedBuilder, AuditLogEvent } from 'discord.js';

export default async (client, ban) => {
  const guildSettings = client.guild_settings.find((e) => e.guildId === ban.guild.id);
  if (await guildSettings.settings_db.exists("/log_channel")) {
    const log_settings = await guildSettings.settings_db.getData("/log_channel");
    const lang = client.localization_manager.getLanguage(
      await guildSettings.settings_db.getData("/language"),
    );
    const logChannel = client.channels.cache.get(log_settings.log_channel_id);
    const fetchedLogs1 = await ban.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBan,
    });
    const banLog = fetchedLogs1.entries.first();
    if (banLog.createdTimestamp < Date.now() - 1000) {
      return;
    }
    let reason = lang.no_reason_given;
    if (banLog.reason) {
      reason = banLog.reason;
    }
    logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#880808")
          .setAuthor({
            name: ban.user.tag,
            iconURL: ban.user.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(lang.log_user_banned.replace("{u}", `<@${ban.user.id}>`))
          .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
          .addFields(
            {
              name: lang.responsible_moderator,
              value: `<@${banLog.executor.id}>`,
              inline: true,
            },
            {
              name: lang.reason,
              value: reason,
              inline: true,
            },
          )
          .setTimestamp()
          .setFooter({
            text: ban.guild.name,
            iconURL: ban.guild.iconURL(),
          }),
      ],
    });
  }
};
