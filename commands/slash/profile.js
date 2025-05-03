import { EmbedBuilder, InteractionContextType, GuildMember, MessageFlags } from "discord.js";
import SlashCommand from "../../lib/SlashCommand.js";
import moment from "moment";

const command = new SlashCommand()
  .setName("profile")
  .setDescription("Show a details of a certain user.")
  .setNameLocalizations({
    hu: "profil",
  })
  .setDescriptionLocalizations({
    hu: "Kiírja a felhasználó információit.",
  })
  .setContexts(InteractionContextType.Guild)
  .addMentionableOption((option) =>
    option
      .setName("target_user")
      .setDescription("Target user")
      .setNameLocalizations({
        hu: "felhasználó",
      })
      .setDescriptionLocalizations({
        hu: "Kit szeretnél megnézni?",
      })
      .setRequired(true),
  )
  .addBooleanOption((option) =>
    option
      .setName("hidden")
      .setDescription("Should be hidden the answer?")
      .setNameLocalizations({
        hu: "rejtett",
      })
      .setDescriptionLocalizations({
        hu: "Rejtett legyen a válasz?",
      })
      .setRequired(false),
  )

  .setRun(async (client, interaction, options) => {
    const guildSettings = client.guild_settings.find((e) => e.guildId === interaction.guildId);
    moment.locale(guildSettings.settings_db.data.language);
    let lang = client.localization_manager.getLanguage(guildSettings.settings_db.data.language);
    if (client.commandLimiter.take(interaction.member.id)) {
      client.log(
        `${interaction.guild.name}(${interaction.guildId}) | User hit the rate limit: ${interaction.user.username}(${interaction.member.id}).`,
      );
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.please_wait_between),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (await client.is_it_word_game_channel(interaction.channel, guildSettings)) {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.cant_use_it_here),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    let target_user = interaction.options.getMentionable("target_user", true);
    let hidden_answer = interaction.options.getBoolean("hidden", false);
    if (!hidden_answer) hidden_answer = false;
    if (!(target_user instanceof GuildMember)) {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.invalid_data),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    let user_status;
    if (target_user.presence?.status) {
      if (target_user.presence.status === "online") {
        user_status = lang.user_online;
      }
      if (target_user.presence.status === "dnd") {
        user_status = lang.user_dnd;
      }
      if (target_user.presence.status === "idle") {
        user_status = lang.user_away;
      }
      if (target_user.presence.status === "offline") {
        user_status = lang.user_offline1;
      }
    } else {
      user_status = lang.user_offline2;
    }
    if (hidden_answer) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x000000)
            .setAuthor({
              name: target_user.user.tag,
              iconURL: target_user.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(lang.command_profile.replace("{u}", `<@${target_user.id}>`))
            .addFields(
              {
                name: lang.account_created,
                value: `\`${moment(target_user.user.createdAt).format(
                  lang.time_format,
                )}\` \n **${moment(target_user.user.createdAt).fromNow()}**`,
                inline: true,
              },
              {
                name: lang.user_joined,
                value: `\`${moment(target_user.joinedAt).format(
                  lang.time_format,
                )}\` \n **${moment(target_user.joinedAt).fromNow()}**`,
              },
            )
            .addFields(
              {
                name: lang.nickname,
                value: target_user.nickname ?? "-",
                inline: true,
              },
              {
                name: ":identification_card: ID:",
                value: target_user.id,
                inline: true,
              },
              {
                name: lang.status,
                value: user_status,
                inline: true,
              },
              {
                name: lang.active_punishments,
                value: `${
                  target_user.voice.serverMute ? ":white_check_mark:" : ":x:"
                } ${lang.mute}\n${
                  target_user.voice.serverDeaf ? ":white_check_mark:" : ":x:"
                } ${lang.deafen}\n${
                  target_user.isCommunicationDisabled() ? ":white_check_mark:" : ":x:"
                } ${lang.timeout}`,
                inline: true,
              },
              {
                name: lang.expire,
                value: `${
                  target_user.isCommunicationDisabled()
                    ? moment(target_user.communicationDisabledUntilTimestamp).fromNow()
                    : "-"
                }`,
                inline: true,
              },
              {
                name: lang.highest_role,
                value: `${target_user.roles.highest.name}`,
                inline: true,
              },
            )
            .setTimestamp()
            .setThumbnail(target_user.user.displayAvatarURL({ dynamic: true }))
            .setFooter({
              text: interaction.guild.name,
              iconURL: interaction.guild.iconURL(),
            }),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } else {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x000000)
            .setAuthor({
              name: target_user.user.tag,
              iconURL: target_user.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(lang.command_profile.replace("{u}", `<@${target_user.id}>`))
            .addFields(
              {
                name: lang.account_created,
                value: `\`${moment(target_user.user.createdAt).format(
                  lang.time_format,
                )}\` \n **${moment(target_user.user.createdAt).fromNow()}**`,
                inline: true,
              },
              {
                name: lang.user_joined,
                value: `\`${moment(target_user.joinedAt).format(
                  lang.time_format,
                )}\` \n **${moment(target_user.joinedAt).fromNow()}**`,
              },
            )
            .addFields(
              {
                name: lang.nickname,
                value: target_user.nickname ?? "-",
                inline: true,
              },
              {
                name: ":identification_card: ID:",
                value: target_user.id,
                inline: true,
              },
              {
                name: lang.status,
                value: user_status,
                inline: true,
              },
              {
                name: lang.active_punishments,
                value: `${
                  target_user.voice.serverMute ? ":white_check_mark:" : ":x:"
                } ${lang.mute}\n${
                  target_user.voice.serverDeaf ? ":white_check_mark:" : ":x:"
                } ${lang.deafen}\n${
                  target_user.isCommunicationDisabled() ? ":white_check_mark:" : ":x:"
                } ${lang.timeout}`,
                inline: true,
              },
              {
                name: lang.expire,
                value: `${
                  target_user.isCommunicationDisabled()
                    ? moment(target_user.communicationDisabledUntilTimestamp).fromNow()
                    : "-"
                }`,
                inline: true,
              },
              {
                name: lang.highest_role,
                value: `${target_user.roles.highest.name}`,
                inline: true,
              },
            )
            .setTimestamp()
            .setThumbnail(target_user.user.displayAvatarURL({ dynamic: true }))
            .setFooter({
              text: interaction.guild.name,
              iconURL: interaction.guild.iconURL(),
            }),
        ],
      });
    }
    moment.locale("en");
  });
export default command;
