const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const IsInvitation = require("is-discord-invite");
const { doesContainBadWords, textToLatin } = require("deep-profanity-filter");
const clone = require("../lib/discord-cloner");
const { request } = require(".././lib/easy-anti-fishing");
module.exports = async (client, oldMessage, newMessage) => {
  if (oldMessage.partial) oldMessage = await oldMessage.fetch();
  if (newMessage.partial) newMessage = await newMessage.fetch();
  if (
    newMessage.author.bot ||
    newMessage.webhookId ||
    newMessage.channel.isDMBased() ||
    newMessage.content === "" ||
    oldMessage.content === ""
  )
    return;
  const guild_settings = client.guild_settings.find((e) => e.guildId === newMessage.guild.id);
  let settingsDb = await guild_settings.settings_db.getData("/");
  const lang = client.localization_manager.getLanguage(settingsDb.language);

  if (
    !newMessage.member.permissions.has(PermissionsBitField.Flags.Administrator) &&
    newMessage.member.id !== newMessage.guild.ownerId
  ) {
    if (settingsDb.automod_links || settingsDb.automod_invite) {
      let checked_data = "";
      let matched_data = [
        ...newMessage.content.matchAll(
          "(http(s)?:\\/\\/.)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)",
        ),
      ];
      for (let i = 0; i < matched_data.length; i++) {
        checked_data += `${matched_data[i][0]} `;
      }
      if (client.is_it_shortened(checked_data)) {
        await newMessage.delete();
        return newMessage.channel
          .send({
            embeds: [
              client.WarningEmbed(lang.warning_title, lang.automod_url_shortener),
            ],
          })
          .then((msg) => {
            setTimeout(() => msg.delete(), 20000);
          });
      }
      if (matched_data && matched_data.length > 0) {
        if (settingsDb.automod_invite) {
          let punish = false;
          let check_result;
          const memberHasIgnoredRoles =
            typeof settingsDb.automod_invite.ignored_role === "function"
              ? settingsDb.automod_invite.ignored_role(newMessage.member.roles.cache)
              : settingsDb.automod_invite.ignored_role.some((r) =>
                  newMessage.member.roles.cache.has(r),
                );
          if (!memberHasIgnoredRoles) {
            if (client.invitespam_limiter.take(newMessage.author.id)) {
              newMessage.delete().catch((error) => {});
              return;
            }
            if (settingsDb.automod_invite.method === "accurate") {
              check_result = await IsInvitation.online(checked_data);
            } else {
              punish = IsInvitation.regex(checked_data);
            }

            if (settingsDb.automod_invite.method === "accurate") {
              if (check_result.success) {
                punish = check_result.isInvitation && check_result.guild.id !== newMessage.guild.id;
              } else {
                punish = IsInvitation.regex(checked_data);
              }
            }
          }
          if (punish) {
            newMessage.channel
              .send({
                embeds: [
                  client.WarningEmbed(lang.warning_title, lang.dont_post_invite),
                ],
              })
              .then((msg) => {
                setTimeout(() => msg.delete(), 20000);
              });
            switch (settingsDb.automod_invite.punishment) {
              case "kick": {
                if (newMessage.member.kickable) await newMessage.member.kick("Automod Invite");
                break;
              }
              case "delete": {
                break;
              }
              case "ban": {
                if (newMessage.member.bannable)
                  await newMessage.member.ban({
                    reason: "Automod Invite",
                  });
                break;
              }
              default: {
                const time_in_min = settingsDb.automod_invite.punishment.split(" ")[1];
                if (newMessage.member.manageable)
                  await newMessage.member.timeout(time_in_min * 60 * 1000, "Automod Invite");
                break;
              }
            }
            await newMessage.delete();
            return;
          }
        }
        if (settingsDb.automod_links) {
          let punish;
          const memberHasIgnoredRoles =
            typeof settingsDb.automod_links.ignored_role === "function"
              ? settingsDb.automod_links.ignored_role(newMessage.member.roles.cache)
              : settingsDb.automod_links.ignored_role.some((r) =>
                  newMessage.member.roles.cache.has(r),
                );
          if (!memberHasIgnoredRoles) {
            if (client.linkspam_limiter.take(newMessage.author.id)) {
              newMessage.delete().catch((error) => {});
              return;
            }
            const checker = await request(checked_data);
            punish = checker && checker.match;
            if (punish) {
              newMessage.channel
                .send({
                  embeds: [
                    client.WarningEmbed(lang.warning_title, lang.automod_links_bad_link),
                  ],
                })
                .then((msg) => {
                  setTimeout(() => msg.delete(), 20000);
                });
              switch (settingsDb.automod_links.punishment) {
                case "kick": {
                  if (newMessage.member.kickable) await newMessage.member.kick("Automod Link");
                  break;
                }
                case "ban": {
                  if (newMessage.member.bannable)
                    await newMessage.member.ban({
                      reason: "Automod Link",
                    });
                  break;
                }
                case "delete": {
                  break;
                }
                default: {
                  const time_in_min = settingsDb.automod_links.punishment.split(" ")[1];
                  if (newMessage.member.manageable)
                    await newMessage.member.timeout(time_in_min * 60 * 1000, "Automod Link");
                  break;
                }
              }
              await newMessage.delete();
              return;
            }
          }
        }
      }
    }
  }
  if (settingsDb.automod_messages) {
    const isChannelIgnored =
      typeof settingsDb.automod_messages.ignored_channel === "function"
        ? settingsDb.automod_messages.ignored_channel(newMessage.channel)
        : settingsDb.automod_messages.ignored_channel.includes(newMessage.channel.id);
    const memberHasIgnoredRoles =
      typeof settingsDb.automod_messages.ignored_role === "function"
        ? settingsDb.automod_messages.ignored_role(newMessage.member.roles.cache)
        : settingsDb.automod_messages.ignored_role.some((r) =>
            newMessage.member.roles.cache.has(r),
          );
    if (!isChannelIgnored && !memberHasIgnoredRoles) {
      if (doesContainBadWords(textToLatin(newMessage.content), client.strongword_filter)) {
        await newMessage.channel
          .send({
            embeds: [
              client.WarningEmbed(lang.warning_title, lang.bad_word_on_image),
            ],
          })
          .then((msg) => {
            setTimeout(() => msg.delete(), 10000);
          });
        newMessage.delete();
        return;
      }
    }
  }

  if (
    settingsDb.log_channel &&
    oldMessage.content.length <= 1024 &&
    newMessage.content.length <= 1024
  ) {
    const log_channel = client.channels.cache.get(settingsDb.log_channel.log_channel_id);

    log_channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#808080")
          .setAuthor({
            name: newMessage.author.tag,
            iconURL: newMessage.author.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(
            lang.log_message_updated
              .replace("{u}", `<@${newMessage.author.id}>`)
              .replace("{c}", `<#${newMessage.channelId}>`)
              .replace("{url}", `${newMessage.url}`),
          )
          .addFields(
            {
              name: lang.old_message,
              value: oldMessage.content,
            },
            {
              name: lang.new_message,
              value: newMessage.content,
            },
          )
          .setTimestamp()
          .setFooter({
            text: newMessage.guild.name,
            iconURL: newMessage.guild.iconURL(),
          }),
      ],
    });
  }
  function insertAtIndex(str, substring, index) {
    return str.slice(0, index) + substring + str.slice(index);
  }
};
