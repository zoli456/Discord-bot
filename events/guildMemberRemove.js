const moment = require("moment/moment");
const { EmbedBuilder, AuditLogEvent } = require("discord.js");

module.exports = async (client, member) => {
  if (member.user.bot) return;

  const guildSettings = client.guild_settings.find(
    (e) => e.guildId === member.guild.id,
  );
  const settingsDb = await guildSettings.settings_db.getData("/");

  if (settingsDb.leave_text) {
    const leaveTextChannel = client.channels.cache.get(
      settingsDb.leave_text.leave_channel_id,
    );
    if (leaveTextChannel) {
      const leaveMessage = settingsDb.leave_text.leave_channel_leave_text
        .replace("{n}", `<@${member.id}>`)
        .replace("{s}", `\`${leaveTextChannel.guild.name}\``);
      leaveTextChannel.send(leaveMessage);
    } else {
      await guildSettings.settings_db.delete("/leave_text");
    }
  }

  if (settingsDb.log_channel && member.id !== client.config.clientId) {
    const lang = client.localization_manager.getLanguage(settingsDb.language);
    const logChannel = client.channels.cache.get(
      settingsDb.log_channel.log_channel_id,
    );
    moment.locale(settingsDb.language);

    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberKick,
    });
    const kickLog = fetchedLogs.entries.first();

    const kickLogValid =
      kickLog &&
      kickLog.target.id === member.user.id &&
      kickLog.createdAt > member.joinedAt;

    const reason =
      kickLogValid && kickLog.reason ? kickLog.reason : lang.no_reason_given;
    const description = kickLogValid
      ? lang.log_member_kicked.replace("{u}", `<@${member.id}>`)
      : lang.log_user_left.replace("{u}", `<@${member.id}>`);
    const fields = kickLogValid
      ? [
          {
            name: lang.responsible_moderator,
            value: `<@${kickLog.executor.id}>`,
            inline: true,
          },
          { name: lang.reason, value: reason, inline: true },
        ]
      : [];

    const embed = new EmbedBuilder()
      .setColor("#880808")
      .setAuthor({
        name: member.user.tag,
        iconURL: member.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(description)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(fields)
      .setTimestamp()
      .setFooter({
        text: member.guild.name,
        iconURL: member.guild.iconURL(),
      });

    logChannel.send({ embeds: [embed] });

    moment.locale("en");
  }

  await client.antiSpam.userleave(member);
};
