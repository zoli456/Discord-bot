import { EmbedBuilder, AuditLogEvent } from 'discord.js';

export default async (client, invite) => {
  const guildSettings = client.guild_settings.find((e) => e.guildId === invite.guild.id);
  if (await guildSettings.settings_db.exists("/log_channel")) {
    const lang = client.localization_manager.getLanguage(
      await guildSettings.settings_db.getData("/language"),
    );
    const log_settings = await guildSettings.settings_db.getData("/log_channel");
    const logChannel = client.channels.cache.get(log_settings.log_channel_id);
    const fetchedLogs1 = await invite.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.InviteDelete,
    });
    const inviteLog = fetchedLogs1.entries.first();
    if (inviteLog) {
      if (inviteLog.createdTimestamp < Date.now() - 1000) return;
      logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#ffbf00")
            .setAuthor({
              name: invite.guild.name,
              iconURL: invite.guild.iconURL(),
            })
            .setDescription(
              lang.log_invite_removed
                .replace("{u}", `<@${inviteLog.executorId}>`)
                .replace("{i}", `\`${invite.code}\``),
            )
            .setTimestamp()
            .setFooter({
              text: inviteLog.executor.username,
              iconURL: inviteLog.executor.displayAvatarURL({ dynamic: true }),
            }),
        ],
      });
    }
  }
};
