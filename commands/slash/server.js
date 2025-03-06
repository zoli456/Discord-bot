const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder, MessageFlags, InteractionContextType } = require("discord.js");

const moment = require("moment/moment");

const command = new SlashCommand()
  .setName("server")
  .setDescription("Show some data of the server")
  .setNameLocalizations({
    hu: "szerver",
  })
  .setDescriptionLocalizations({
    hu: "Kiírja a szever adatait",
  })
  .setContexts(InteractionContextType.Guild)
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
    const lang = client.localization_manager.getLanguage(guildSettings.settings_db.data.language);
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
    let hidden_answer = interaction.options.getBoolean("hidden", false);
    if (!hidden_answer) hidden_answer = false;
    let users = await interaction.guild.members.fetch();
    if (hidden_answer) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x000000)
            .setAuthor({
              name: interaction.user.tag,
              iconURL: interaction.user.avatarURL(),
            })
            .setDescription(`**${interaction.guild.name}** ${lang.server_details}`)
            .addFields(
              {
                name: `:identification_card:${lang.server_identifier}`,
                value: interaction.guild.id,
                inline: true,
              },

              {
                name: lang.number_of_member,
                value: users.filter((member) => !member.user.bot).size.toString(),
                inline: true,
              },
              {
                name: lang.number_of_bots,
                value: users.filter((member) => member.user.bot).size.toString(),
                inline: true,
              },
              {
                name: lang.owner_of_the_server,
                value: `${interaction.guild.ownerId}\n<@${interaction.guild.ownerId}>`,
                inline: true,
              },
              {
                name: `:timer: ${lang.server_creation_date}`,
                value: `\`${moment(interaction.guild.createdAt).format(
                  lang.time_format,
                )}\` \n **${moment(interaction.guild.createdAt).fromNow()}**`,
                inline: true,
              },
            )
            .setTimestamp()
            .setThumbnail(interaction.guild.iconURL())
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
              name: interaction.user.tag,
              iconURL: interaction.user.avatarURL(),
            })
            .setDescription(`**${interaction.guild.name}** ${lang.server_details}`)
            .addFields(
              {
                name: `:identification_card:${lang.server_identifier}`,
                value: interaction.guild.id,
                inline: true,
              },

              {
                name: lang.number_of_member,
                value: users.filter((member) => !member.user.bot).size.toString(),
                inline: true,
              },
              {
                name: lang.number_of_bots,
                value: users.filter((member) => member.user.bot).size.toString(),
                inline: true,
              },
              {
                name: lang.owner_of_the_server,
                value: `${interaction.guild.ownerId}\n<@${interaction.guild.ownerId}>`,
                inline: true,
              },
              {
                name: `:timer: ${lang.server_creation_date}`,
                value: `\`${moment(interaction.guild.createdAt).format(
                  lang.time_format,
                )}\` \n **${moment(interaction.guild.createdAt).fromNow()}**`,
                inline: true,
              },
            )
            .setTimestamp()
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({
              text: interaction.guild.name,
              iconURL: interaction.guild.iconURL(),
            }),
        ],
      });
    }
    moment.locale("en");
  });
module.exports = command;
