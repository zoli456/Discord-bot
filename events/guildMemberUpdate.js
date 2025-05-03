import { EmbedBuilder, AuditLogEvent, PermissionsBitField } from "discord.js";
import moment from "moment";
import { textToLatin, doesContainBadWords } from "deep-profanity-filter";

export default async (client, oldMember, newMember) => {
  if (oldMember.id === client.config.clientId || oldMember.user.bot) return;
  const guildSettings = client.guild_settings.find((e) => e.guildId === oldMember.guild.id);
  const setttings_db = await guildSettings.settings_db.getData("/");
  const lang = client.localization_manager.getLanguage(setttings_db.language);
  if (
    setttings_db.automod_names &&
    oldMember.displayName !== newMember.displayName &&
    !newMember.permissions.has(PermissionsBitField.Flags.Administrator) &&
    newMember.id !== newMember.guild.ownerId &&
    doesContainBadWords(textToLatin(newMember.displayName), client.strongword_filter)
  ) {
    const memberHasIgnoredRoles =
      typeof setttings_db.automod_names.ignored_role === "function"
        ? setttings_db.automod_names.ignored_role(newMember.roles.cache)
        : setttings_db.automod_names.ignored_role.some((r) => newMember.roles.cache.has(r));
    if (!memberHasIgnoredRoles) {
      if (!newMember.nickname) {
        await newMember.setNickname(lang.temp_name);
      } else {
        await newMember.setNickname("");
      }
    }
  }

  if (!setttings_db.log_channel) return;

  const logChannel = client.channels.cache.get(setttings_db.log_channel.log_channel_id);

  const embedBuilder = new EmbedBuilder();

  if (oldMember.nickname !== newMember.nickname) {
    embedBuilder
      .setColor(newMember.nickname ? "#ffa500" : "#964b00")
      .setAuthor({
        name: oldMember.user.tag,
        iconURL: oldMember.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        newMember.nickname
          ? lang.log_nickname_changed.replace("{u}", `<@${oldMember.id}>`)
          : lang.log_nickname_removed.replace("{u}", `<@${oldMember.id}>`),
      )
      .setThumbnail(oldMember.user.displayAvatarURL({ dynamic: true }));

    if (oldMember.nickname && newMember.nickname) {
      embedBuilder.addFields(
        { name: lang.old_nickname, value: oldMember.nickname, inline: true },
        { name: lang.new_nickname, value: newMember.nickname, inline: true },
      );
    } else if (!oldMember.nickname && newMember.nickname) {
      embedBuilder.addFields({
        name: lang.new_nickname,
        value: newMember.nickname,
        inline: true,
      });
    }

    embedBuilder.setTimestamp().setFooter({
      text: oldMember.guild.name,
      iconURL: oldMember.guild.iconURL(),
    });

    logChannel.send({
      embeds: [
        embedBuilder,
      ],
    });
  }

  if (
    !oldMember.communicationDisabledUntilTimestamp &&
    newMember.communicationDisabledUntilTimestamp
  ) {
    moment.locale(setttings_db.language);
    const fetchedLogs1 = await oldMember.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.GuildMemberUpdate,
    });
    const muteLog = fetchedLogs1.entries.first();
    const reason = muteLog?.reason || lang.no_reason_given;

    embedBuilder
      .setColor("#964b00")
      .setAuthor({
        name: oldMember.user.tag,
        iconURL: oldMember.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(lang.log_user_timed_out.replace("{u}", `<@${newMember.id}>`))
      .setThumbnail(oldMember.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: lang.responsible_moderator,
          value: `<@${muteLog.executor.id}>`,
          inline: true,
        },
        { name: lang.reason, value: reason, inline: true },
        {
          name: lang.expire,
          value: `\`${moment(newMember.communicationDisabledUntilTimestamp).format(
            lang.time_format,
          )}\` \n **${moment(newMember.communicationDisabledUntilTimestamp).fromNow()}**`,
        },
      )
      .setTimestamp()
      .setFooter({
        text: oldMember.guild.name,
        iconURL: oldMember.guild.iconURL(),
      });

    logChannel.send({
      embeds: [
        embedBuilder,
      ],
    });
    moment.locale("en");
  }

  if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
    const fetchedLogs = await oldMember.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.GuildMemberUpdate,
    });

    const roleAddLog = fetchedLogs.entries.first();
    if (roleAddLog) {
      const { executor, changes } = roleAddLog;

      if (changes === undefined || changes[0]?.new[0]?.name === undefined) return;

      if (roleAddLog.targetId !== oldMember.id) return;
      const reason = roleAddLog?.reason || lang.no_reason_given;

      embedBuilder
        .setColor("#9f2b68")
        .setAuthor({
          name: oldMember.user.tag,
          iconURL: oldMember.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(lang.log_member_updated.replace("{u}", `<@${oldMember.id}>`))
        .setThumbnail(oldMember.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          {
            name: lang.roles,
            value: `${
              oldMember.roles.cache.size < newMember.roles.cache.size ? ":white_check_mark:" : ":x:"
            } ${changes[0]?.new[0]?.name}`,
          },
          {
            name: lang.responsible_moderator,
            value: `<@${executor.id}>`,
            inline: true,
          },
          { name: lang.reason, value: reason, inline: true },
        )
        .setTimestamp()
        .setFooter({
          text: oldMember.guild.name,
          iconURL: oldMember.guild.iconURL(),
        });

      logChannel.send({
        embeds: [
          embedBuilder,
        ],
      });
    }
  }
};
