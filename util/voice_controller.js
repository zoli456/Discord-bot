import {
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  TextInputStyle,
  ModalBuilder,
  TextInputBuilder,
  PermissionsBitField,
  MessageFlags,
} from 'discord.js';

import { doesContainBadWords, textToLatin } from 'deep-profanity-filter';
import colors from '@colors/colors';

export default async (client, interaction) => {
  const _db = client.guild_settings.find((e) => e.guildId === interaction.guildId);

  if (!(await _db.settings_db.exists("/voice_controller"))) {
    return;
  }

  const voice_controller_config = await _db.settings_db.getData("/voice_controller");

  const property = interaction.customId.split(":")[2];
  const lang = client.localization_manager.getLanguage(await _db.settings_db.getData("/language"));

  if (!interaction.member.voice.channel) {
    return interaction
      .reply({
        embeds: [
          client.WarningEmbed(lang.warning_title, lang.you_must_be_action),
        ],
        flags: MessageFlags.Ephemeral,
      })
      .then((msg) => setTimeout(() => msg.delete(), 20000));
  }

  const index = client.tempchannel_owners.findIndex(
    (element) => element.channelID === interaction.member.voice.channel.id,
  );

  if (index === -1) {
    return interaction
      .reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.temp_channel_not_tempchannel),
        ],
        flags: MessageFlags.Ephemeral,
      })
      .then((msg) => setTimeout(() => msg.delete(), 20000));
  }

  const tempChannelOwner = client.tempchannel_owners[index];

  if (tempChannelOwner.owner !== interaction.user.id) {
    if (property !== "Claim") {
      return interaction
        .reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, lang.temp_channel_not_yours),
          ],
          flags: MessageFlags.Ephemeral,
        })
        .then((msg) => setTimeout(() => msg.delete(), 20000));
    } else {
      const singleChannel = interaction.guild.members.cache.filter(
        (member) =>
          member.voice.channel === interaction.member.voice.channel &&
          member.id === tempChannelOwner.owner,
      );

      if (singleChannel.size === 1) {
        return interaction
          .reply({
            embeds: [
              client.ErrorEmbed(lang.error_title, lang.temp_channel_owner_still_here),
            ],
            flags: MessageFlags.Ephemeral,
          })
          .then((msg) => setTimeout(() => msg.delete(), 20000));
      } else {
        await interaction.member.voice.channel.permissionOverwrites.delete(
          client.tempchannel_owners[index].owner,
        );
        client.tempchannel_owners[index] = {
          channelID: interaction.member.voice.channel.id,
          owner: interaction.user.id,
        };
        await interaction.member.voice.channel.permissionOverwrites.edit(interaction.user.id, {
          Connect: true,
        });

        client.logger.log(
          `${colors.blue(interaction.guild.name)}(${interaction.guild.id}) | ${colors.blue(interaction.user.username)}(${interaction.user.id}) took the ownership of a channel(${interaction.member.voice.channel.id}).`,
        );

        return interaction
          .reply({
            embeds: [
              client.SuccessEmbed(lang.temp_channel_successful_claim),
            ],
            flags: MessageFlags.Ephemeral,
          })
          .then((msg) => setTimeout(() => msg.delete(), 20000));
      }
    }
  } else {
    if (property === "Claim") {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.temp_channel_your_are_the_owner),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (property === "Rename") {
    const fields = {
      name: new TextInputBuilder()
        .setCustomId(`name:${interaction.guild.id}`)
        .setLabel(lang.temp_channel_rename_label)
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(30)
        .setMinLength(3),
    };

    const modal = new ModalBuilder()
      .setCustomId(`rename_modal:${interaction.guild.id}`)
      .setTitle(lang.temp_channel_rename_title)
      .setComponents(new ActionRowBuilder().addComponents(fields.name));
    await interaction.showModal(modal);
    const submitted = await interaction
      .awaitModalSubmit({
        time: 60000,
        filter: (i) => i.user.id === interaction.user.id,
      })
      .catch((error) => {
        return null;
      })
      .then(async (i) => {
        if (i) {
          const name = i.fields.getTextInputValue(`name:${interaction.guild.id}`).trim();
          if (doesContainBadWords(textToLatin(name), client.strongword_filter)) {
            return i
              .reply({
                embeds: [
                  client.ErrorEmbed(lang.error_title, lang.temp_channel_not_appropriate),
                ],
                flags: MessageFlags.Ephemeral,
              })
              .then((msg) => setTimeout(() => msg.delete(), 20000));
          } else {
            if (client.tempchannel_namechange_Limiter.take(interaction.member.voice.channel.id)) {
              return i
                .reply({
                  embeds: [
                    client.WarningEmbed(lang.warning_title, lang.temp_channel_change_limit),
                  ],
                  flags: MessageFlags.Ephemeral,
                })
                .then((msg) => setTimeout(() => msg.delete(), 20000));
            }
            await interaction.member.voice.channel.setName(name);
            client.logger.log(
              `${colors.blue(interaction.guild.name)}(${interaction.guild.id}) | ${colors.blue(interaction.user.username)}(${interaction.user.id}) renamed his channel to ${name}`,
            );
            return i
              .reply({
                embeds: [
                  client.SuccessEmbed(`${lang.temp_channel_successful_rename}${name}`),
                ],
                flags: MessageFlags.Ephemeral,
              })
              .then((msg) => setTimeout(() => msg.delete(), 20000));
          }
        }
      });
  }
  if (property === "Limit") {
    const fields = {
      name: new TextInputBuilder()
        .setCustomId(`limit:${interaction.guild.id}`)
        .setLabel(lang.temp_channel_limit_label)
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(2)
        .setValue("25")
        .setMinLength(1),
    };

    const modal = new ModalBuilder()
      .setCustomId(`limit_modal:${interaction.guild.id}`)
      .setTitle(lang.temp_channel_limit_title)
      .setComponents(new ActionRowBuilder().addComponents(fields.name));
    await interaction.showModal(modal);
    const submitted = await interaction
      .awaitModalSubmit({
        time: 60000,
        filter: (i) => i.user.id === interaction.user.id,
      })
      .catch((error) => {
        return null;
      })
      .then(async (i) => {
        if (i) {
          const user_limit = i.fields.getTextInputValue(`limit:${interaction.guild.id}`).trim();
          if (!/\d/.test(user_limit)) {
            return i
              .reply({
                embeds: [
                  client.ErrorEmbed(lang.error_title, lang.temp_channel_limit_not_number),
                ],
                flags: MessageFlags.Ephemeral,
              })
              .then((msg) => setTimeout(() => msg.delete(), 20000));
          } else {
            if (user_limit < 0 || user_limit >= 100) {
              return i
                .reply({
                  embeds: [
                    client.ErrorEmbed(lang.error_title, lang.temp_channel_limit_bad_number),
                  ],
                  flags: MessageFlags.Ephemeral,
                })
                .then((msg) => setTimeout(() => msg.delete(), 20000));
            }
            await interaction.member.voice.channel.setUserLimit(Number(user_limit));
            client.logger.log(
              `${colors.blue(interaction.guild.name)}(${interaction.guild.id}) | ${colors.blue(interaction.user.username)}(${interaction.user.id}) changed the userlimit in his channel to ${user_limit}`,
            );
            return i
              .reply({
                embeds: [
                  client.SuccessEmbed(`${lang.temp_channel_successful_limit}${user_limit}`),
                ],
                flags: MessageFlags.Ephemeral,
              })
              .then((msg) => setTimeout(() => msg.delete(), 20000));
          }
        }
      });
  }

  if (property === "Hide") {
    await interaction.member.voice.channel.permissionOverwrites.edit(
      voice_controller_config.voice_controller_base_role_id,
      { ViewChannel: false },
    );

    client.logger.log(
      `${colors.blue(interaction.guild.name)}(${interaction.guild.id}) | ${colors.blue(interaction.user.username)}(${interaction.user.id}) hid his channel.`,
    );

    return interaction
      .reply({
        embeds: [
          client.SuccessEmbed(lang.temp_channel_successful_hide),
        ],
        flags: MessageFlags.Ephemeral,
      })
      .then((msg) => setTimeout(() => msg.delete(), 20000));
  }

  if (property === "Unhide") {
    await interaction.member.voice.channel.permissionOverwrites.edit(
      voice_controller_config.voice_controller_base_role_id,
      { ViewChannel: true },
    );

    client.logger.log(
      `${colors.blue(interaction.guild.name)}(${interaction.guild.id}) | ${colors.blue(interaction.user.username)}(${interaction.user.username}) unhid his channel.`,
    );

    return interaction
      .reply({
        embeds: [
          client.SuccessEmbed(lang.temp_channel_successful_unhide),
        ],
        flags: MessageFlags.Ephemeral,
      })
      .then((msg) => setTimeout(() => msg.delete(), 20000));
  }

  if (property === "Lock") {
    await interaction.member.voice.channel.permissionOverwrites.edit(
      voice_controller_config.voice_controller_base_role_id,
      { Connect: false },
    );

    client.logger.log(
      `${colors.blue(interaction.guild.name)}(${interaction.guild.id}) | ${colors.blue(interaction.user.username)}(${interaction.user.id}) locked his channel.`,
    );
    return interaction
      .reply({
        embeds: [
          client.SuccessEmbed(lang.temp_channel_successful_lock),
        ],
        flags: MessageFlags.Ephemeral,
      })
      .then((msg) => setTimeout(() => msg.delete(), 20000));
  }

  if (property === "Unlock") {
    await interaction.member.voice.channel.permissionOverwrites.edit(
      voice_controller_config.voice_controller_base_role_id,
      { Connect: true },
    );
    client.logger.log(
      `${colors.blue(interaction.guild.name)}(${interaction.guild.id}) | ${colors.blue(interaction.user.id)} unlocked his channel.`,
    );

    return interaction
      .reply({
        embeds: [
          client.SuccessEmbed(lang.temp_channel_successful_unlock),
        ],
        flags: MessageFlags.Ephemeral,
      })
      .then((msg) => setTimeout(() => msg.delete(), 20000));
  }

  if (property === "Kick" || property === "Ban") {
    const usersOnChannel = [];
    interaction.guild.members.cache
      .filter((member) => member.voice.channel === interaction.member.voice.channel)
      .forEach((member) => {
        if (
          member.id !== interaction.user.id &&
          member.kickable &&
          !member.permissions.has(PermissionsBitField.Flags.Administrator) &&
          member.id !== process.env.ADMINID
        ) {
          usersOnChannel.push({
            label: member.user.username,
            value: member.id,
            description: member.id,
          });
        }
      });

    if (usersOnChannel.length === 0) {
      return interaction
        .reply({
          embeds: [
            client.WarningEmbed(lang.warning_title, lang.temp_channel_no_appropriate_target),
          ],
          flags: MessageFlags.Ephemeral,
        })
        .then((msg) => setTimeout(() => msg.delete(), 20000));
    }

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("target_selector")
        .setPlaceholder(lang.temp_channel_select_somebody)
        .addOptions(usersOnChannel),
    );

    let chosenTarget = await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#00FFFF")
          .setDescription(lang.temp_channel_select_somebody_description),
      ],
      components: [
        menu,
      ],
      flags: MessageFlags.Ephemeral,
      withResponse: true,
    });

    const filter = (button) => button.user.id === interaction.user.id;

    const targetCollector = chosenTarget.resource.message.createMessageComponentCollector({
      filter,
      time: 30000,
    });
    targetCollector.on("collect", async (i) => {
      if (i.isStringSelectMenu()) {
        await i.deferUpdate();
        const targetUser = await client.users.fetch(i.values[0]);

        await interaction.guild.members.cache
          .get(i.values[0])
          .voice.disconnect(`Requested by <@${tempChannelOwner.owner}>`);

        if (property === "Kick") {
          client.logger.log(
            `${colors.blue(interaction.guild.name)}(${interaction.guild.id}) 👢 ${colors.blue(interaction.user.username)}(${interaction.user.id}) kicked ${colors.red(targetUser.username)}(${targetUser.id}) from his channel.`,
          );
          i.editReply({
            content: null,
            embeds: [
              client.SuccessEmbed(
                lang.temp_channel_successful_kick.replace("{target}", `<@${i.values[0]}>`),
              ),
            ],
            components: [],
          });

          setTimeout(() => interaction.deleteReply(), 20000);
        } else {
          client.logger.log(
            `${colors.blue(interaction.guild.name)}(${interaction.guild.id}) ☠️ ${colors.blue(interaction.user.username)}(${interaction.user.username}) banned ${colors.red(targetUser.username)}(${targetUser.id}) from his channel.`,
          );

          await interaction.member.voice.channel.permissionOverwrites.delete(targetUser.id);

          await interaction.member.voice.channel.permissionOverwrites.edit(i.values[0], {
            Connect: false,
          });

          i.editReply({
            content: null,
            embeds: [
              client.SuccessEmbed(
                lang.temp_channel_successful_ban.replace("{target}", `<@${i.values[0]}>`),
              ),
            ],
            components: [],
          });

          setTimeout(() => interaction.deleteReply(), 20000);
        }
      }
    });

    targetCollector.on("end", async (i) => {
      if (i.size === 0) {
        await chosenTarget.edit({
          content: null,
          embeds: [
            client.WarningEmbed(lang.warning_title, lang.temp_channel_you_didnt_select),
          ],
          components: [],
          flags: MessageFlags.Ephemeral,
        });

        setTimeout(() => interaction.deleteReply(), 20000);
      }
    });
  }
};
