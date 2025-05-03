import { EmbedBuilder, AuditLogEvent } from 'discord.js';

export default async (client, emoji) => {
  const guildSettings = client.guild_settings.find((e) => e.guildId === emoji.guild.id);
  if (await guildSettings.settings_db.exists("/log_channel")) {
    const log_settings = await guildSettings.settings_db.getData("/log_channel");
    const lang = client.localization_manager.getLanguage(
      await guildSettings.settings_db.getData("/language"),
    );
    const logChannel = client.channels.cache.get(log_settings.log_channel_id);
    const fetchedLogs1 = await emoji.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.EmojiCreate,
    });
    const emojiLog = fetchedLogs1.entries.first();
    if (emoji.id !== emojiLog.targetId) return;
    //if (emojiLog.createdTimestamp < Date.now() - 1000) return;
    logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#FFA500")
          .setAuthor({
            name: emojiLog.executor.tag,
            iconURL: emojiLog.executor.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(lang.log_emoji_create.replace("{u}", `<@${emojiLog.executorId}>`))
          .addFields(
            {
              name: lang.emoji_title,
              value: `${emoji}`,
              inline: true,
            },
            {
              name: lang.emoji_identifier,
              value: `${emoji.name}`,
              inline: true,
            },
          )
          .setTimestamp()
          .setFooter({
            text: emoji.guild.name,
            iconURL: emoji.guild.iconURL(),
          }),
      ],
    });
  }
};
