const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const schedule = require("node-schedule");
const fs = require("fs");

module.exports = async (client, channel) => {
  const guildSettings = client.guild_settings.find(
    (e) => e.guildId === channel.guildId,
  );
  const settings_db = await guildSettings.settings_db.getData("/");

  const channelsToCheck = [
    {
      key: "counter_channel",
      channel_entry: "counter_channel_id",
      jobPrefix: "counter",
    },
    {
      key: "gamestat_channel",
      channel_entry: "gamestat_channel_id",
      jobPrefix: "gamestat",
    },
    {
      key: "countdown_channel",
      channel_entry: "countdown_channel_id",
      jobPrefix: "countdown",
    },
    {
      key: "nameday_channel",
      channel_entry: "nameday_channel_id",
      jobPrefix: null,
    },
    {
      key: "word_game",
      channel_entry: "word_game_channel_id",
      jobPrefix: null,
      additionalCleanup: true,
    },
    {
      key: "automod_trap_channel",
      channel_entry: "channel_id",
      jobPrefix: null,
    },
    {
      key: "media_channel",
      channel_entry: "media_channel_id",
      jobPrefix: null,
    },
    {
      key: "game_channel",
      channel_entry: "game_channel_id",
      jobPrefix: null,
    },
    {
      key: "log_channel",
      channel_entry: "log_channel_id",
      jobPrefix: null,
    },
    {
      key: "temp_channel",
      channel_entry: "temp_channel_id",
      jobPrefix: null,
    },
    {
      key: "voice_controller",
      channel_entry: "voice_controller_channel_id",
      jobPrefix: null,
    },
  ];

  const disableChannel = async (channelKey, jobPrefix) => {
    await guildSettings.settings_db.delete(`/${channelKey}`);
    if (jobPrefix) {
      let current_job =
        schedule.scheduledJobs[`${channel.guildId}_${jobPrefix}`];
      if (current_job) {
        current_job.cancel();
      }
    }
    client.error(
      `The ${channelKey.replace("_", " ")} (${channel.id}) got disabled because the channel got deleted in ${channel.guild.id} guild.`,
    );
  };

  for (const {
    key,
    jobPrefix,
    channel_entry,
    additionalCleanup,
  } of channelsToCheck) {
    if (settings_db[key] && settings_db[key][channel_entry] === channel.id) {
      await disableChannel(key, jobPrefix);
      if (additionalCleanup && key === "word_game") {
        const wordGameFile = `./info/wordgame/${channel.guild.id}_wordgame.json`;
        if (fs.existsSync(wordGameFile)) {
          fs.unlinkSync(wordGameFile);
        }
      }
    }
  }

  if (settings_db.log_channel) {
    const lang = client.localization_manager.getLanguage(settings_db.language);
    const log_channel = client.channels.cache.get(
      settings_db.log_channel.log_channel_id,
    );
    const fetchedLogs1 = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelDelete,
    });
    const createLog = fetchedLogs1.entries.first();
    if (createLog && createLog.targetId === channel.id) {
      log_channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#800020")
            .setAuthor({
              name: channel.guild.name,
              iconURL: channel.guild.iconURL(),
            })
            .setDescription(
              lang.log_channel_deleted.replace("{c}", `\`${channel.name}\``),
            )
            .addFields({
              name: lang.responsible_moderator,
              value: `<@${createLog.executor.id}>`,
            })
            .setTimestamp()
            .setFooter({
              text: createLog.executor.username,
              iconURL: createLog.executor.displayAvatarURL({ dynamic: true }),
            }),
        ],
      });
    }
  }
};
