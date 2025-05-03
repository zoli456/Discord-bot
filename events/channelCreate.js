import { EmbedBuilder, AuditLogEvent } from "discord.js";

export default async (client, channel) => {
  const guildSettings = client.guild_settings.find((e) => e.guildId === channel.guildId);

  if (await guildSettings.settings_db.exists("/log_channel")) {
    const [
      log_settings, languageSetting,
    ] = await Promise.all([
      guildSettings.settings_db.getData("/log_channel"), guildSettings.settings_db.getData(
        "/language",
      ),
    ]);

    const log_channel = client.channels.cache.get(log_settings.log_channel_id);
    const lang = client.localization_manager.getLanguage(languageSetting);
    const fetchedLogs = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelCreate,
    });
    const createLog = fetchedLogs.entries.first();

    if (!createLog) return;

    const embed = new EmbedBuilder()
      .setColor("#00ffff")
      .setAuthor({
        name: channel.guild.name,
        iconURL: channel.guild.iconURL(),
      })
      .addFields({
        name: lang.responsible_moderator,
        value: `<@${createLog.executor.id}>`,
      })
      .setTimestamp()
      .setFooter({
        text: createLog.executor.username,
        iconURL: createLog.executor.displayAvatarURL({ dynamic: true }),
      });

    if (createLog.executor.id !== client.user.id && createLog.targetId === channel.id) {
      embed.setDescription(lang.log_channel_create.replace("{c}", `\`${channel.name}\``));
    } else {
      embed.setDescription(
        lang.log_temporary_channel_created.replace("{c}", `\`${channel.name}\``),
      );
    }

    log_channel.send({
      embeds: [
        embed,
      ],
    });
  }
};
