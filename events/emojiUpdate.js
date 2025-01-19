const { EmbedBuilder, AuditLogEvent } = require("discord.js");

module.exports = async (client, oldEmoji, newEmoji) => {
  const guildSettings = client.guild_settings.find(
    (e) => e.guildId === oldEmoji.guild.id,
  );
  if (await guildSettings.settings_db.exists("/log_channel")) {
    const log_settings =
      await guildSettings.settings_db.getData("/log_channel");
    const lang = client.localization_manager.getLanguage(
      await guildSettings.settings_db.getData("/language"),
    );
    const logChannel = client.channels.cache.get(log_settings.log_channel_id);
    const fetchedLogs1 = await oldEmoji.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.EmojiUpdate,
    });
    const emojiLog = fetchedLogs1.entries.first();
    if (oldEmoji.id !== emojiLog.targetId) return;
    //if (emojiLog.createdTimestamp < Date.now() - 1000) return;
    logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#FFA500")
          .setAuthor({
            name: emojiLog.executor.tag,
            iconURL: emojiLog.executor.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(
            lang.emoji_changed.replace("{u}", `<@${emojiLog.executorId}>`),
          )
          .addFields(
            {
              name: lang.old_identifier,
              value: `${oldEmoji.name}`,
              inline: true,
            },
            {
              name: lan.new_identifier,
              value: `${newEmoji.name}`,
              inline: true,
            },
          )
          .setTimestamp()
          .setFooter({
            text: oldEmoji.guild.name,
            iconURL: oldEmoji.guild.iconURL(),
          }),
      ],
    });
  }
};
