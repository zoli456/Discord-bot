const { EmbedBuilder, AuditLogEvent } = require("discord.js");

/**
 * On messageDelete events, adds the message to a WeakSet within the bot's client
 * allowing for the bot to easily see which messages have been deleted asynchronously
 * during the run time of the bot
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (
    message.webhookId ||
    message.partial ||
    message.channel.isDMBased() ||
    message.content === ""
  )
    return;
  if (message.author && message.author.bot) return;
  const guild_settings = client.guild_settings.find(
    (e) => e.guildId === message.guild.id,
  );
  let settingsDb = await guild_settings.settings_db.getData("/");
  if (settingsDb.log_channel && message.content.length <= 1024) {
    if (
      settingsDb.game_channel &&
      settingsDb.game_channel.game_channel_id === message.channelId
    )
      return;
    const lang = client.localization_manager.getLanguage(settingsDb.language);
    const logChannel = client.channels.cache.get(
      settingsDb.log_channel.log_channel_id,
    );
    const fetchedLogs1 = await message.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MessageDelete,
    });
    const deleteLog = fetchedLogs1.entries.first();
    if (
      deleteLog &&
      deleteLog.target.id === message.author.id &&
      deleteLog.createdTimestamp > Date.now() - 1000
    ) {
      logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#000000")
            .setAuthor({
              name: message.author.tag,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(
              lang.log_message_removed
                .replace("{u}", `<@${message.author.id}>`)
                .replace("{c}", `<#${message.channelId}>`),
            )
            .addFields(
              {
                name: lang.responsible_user,
                value: `<@${deleteLog.executor.id}>`,
              },
              {
                name: lang.content_of_message,
                value: message.content,
              },
            )
            .setTimestamp()
            .setFooter({
              text: message.guild.name,
              iconURL: message.guild.iconURL(),
            }),
        ],
      });
    } else {
      logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#000000")
            .setAuthor({
              name: message.author.tag,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(
              lang.log_message_removed
                .replace("{u}", `<@${message.author.id}>`)
                .replace("{c}", `<#${message.channelId}>`),
            )
            .addFields({
              name: lang.content_of_message,
              value: message.content,
            })
            .setTimestamp()
            .setFooter({
              text: message.guild.name,
              iconURL: message.guild.iconURL(),
            }),
        ],
      });
    }
  }
};
