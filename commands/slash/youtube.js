const { ChannelType, InteractionContextType, PermissionsBitField } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");
const YoutubeChecker = require("../..//lib/YoutubeChecker");

const command = new SlashCommand()
  .setName("youtube")
  .setDescription("Youtube video/stream notifications.")
  .setContexts(InteractionContextType.Guild)
  .setNameLocalizations({
    hu: "youtube",
  })
  .setDescriptionLocalizations({
    hu: "Youtube videó/stream értesítések.",
  });
command.addSubcommand((subcommand) =>
  subcommand
    .setName("add")
    .setDescription("Add a Youtube user.")
    .setNameLocalizations({
      hu: "hozzáadás",
    })
    .setDescriptionLocalizations({
      hu: "Hozzáad egy Youtube felhasználót a listához.",
    })
    .addStringOption((option) =>
      option
        .setName("youtube_user")
        .setDescription("Twitch user to watch.")
        .setAutocomplete(false)
        .setMinLength(2)
        .setMaxLength(128)
        .setNameLocalizations({
          hu: "youtube_felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Youtube felhasználó neve.",
        })
        .setRequired(true),
    )
    .addChannelOption((option2) =>
      option2
        .setName("channel")
        .setDescription("Post the notifications into this channel.")
        .setNameLocalizations({
          hu: "csatorna",
        })
        .setDescriptionLocalizations({
          hu: "Ebbe a csatornába küldi az értesítéseket.",
        })
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText),
    )
    .addRoleOption((option3) =>
      option3
        .setName("mention")
        .setDescription("Which role should I mention?")
        .setRequired(false)
        .setNameLocalizations({
          hu: "megemlítés",
        })
        .setDescriptionLocalizations({
          hu: "Mely szereped említsem meg?",
        }),
    )
    .addStringOption((option4) =>
      option4
        .setName("mass_mention")
        .setDescription("Mentioning @everyone or @here?")
        .setAutocomplete(false)
        .setRequired(false)
        .addChoices({ name: "Everyone", value: "@everyone" }, { name: "Here", value: "@here" })
        .setNameLocalizations({
          hu: "tömeges_megemlítés",
        })
        .setDescriptionLocalizations({
          hu: "@everyone vagy @here megemlítés?",
        }),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("list")
    .setDescription("List the Youtube notifications for the current guild.")
    .setNameLocalizations({
      hu: "lista",
    })
    .setDescriptionLocalizations({
      hu: "Kilistázza a Youtube értesítseket a jelenlegi szerveren.",
    }),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("delete")
    .setDescription("Delete a Youtube notification.")
    .setNameLocalizations({
      hu: "törlés",
    })
    .setDescriptionLocalizations({
      hu: "Kikapcsol egy Youtube értesítést a szerveren.",
    })
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("Id of the Youtube notification.")
        .setAutocomplete(false)
        .setMinValue(0)
        .setMaxValue(4)
        .setNameLocalizations({
          hu: "id",
        })
        .setDescriptionLocalizations({
          hu: "Youtube értesítés azonosítója.",
        })
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("delete-all")
    .setDescription("Delete all feeds from the guild.")
    .setNameLocalizations({
      hu: "mind-törlés",
    })
    .setDescriptionLocalizations({
      hu: "Kikapcsolja az összes értesítést a szerveren.",
    }),
);
command.setRun(async (client, interaction, options) => {
  const guildSettings = client.guild_settings.find((e) => e.guildId === interaction.guildId);
  const lang = client.localization_manager.getLanguage(
    await guildSettings.settings_db.getData("/language"),
  );
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
  if (
    interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
    interaction.user.id === process.env.ADMINID
  ) {
    if (interaction.options.getSubcommand() === "add") {
      let youtube_user = options.getString("youtube_user", true).trim();
      let mention = options.getRole("mention", false);
      let mass_mention = options.getString("mass_mention", false);
      let channel = options.getChannel("channel", true);
      for (let i = 0; i < client.youtube_list.length; i++) {
        if (
          client.youtube_list[i].channel_id === channel.id &&
          client.youtube_list[i].youtube_user === youtube_user
        ) {
          return interaction.reply({
            embeds: [
              client.ErrorEmbed(lang.error_title, "This a duplicate."),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
      }
      if (client.youtube_list.filter((x) => x.guild_id === interaction.guildId).length >= 4) {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, "You reached the limit(3) feeds on this server."),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      const YoutubeLookupData = await YoutubeChecker.getYouTubeChannelIdBySearch(youtube_user);
      if (YoutubeLookupData === null) {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, "Failed to fetch the channel id"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      let mention_mod;
      if (mass_mention) {
        mention_mod = mass_mention;
      } else if (mention) {
        mention_mod = mention.id;
      }
      if (await guildSettings.settings_db.exists("/youtube")) {
        const temp = await guildSettings.settings_db.getData("/youtube");
        temp.push({
          youtube_user: youtube_user,
          youtube_channel_id: YoutubeLookupData,
          channel_id: channel.id,
          mention: mention_mod,
        });
        await guildSettings.settings_db.push("/youtube", temp);
      } else {
        await guildSettings.settings_db.push("/youtube", [
          {
            youtube_user: youtube_user,
            youtube_channel_id: YoutubeLookupData,
            channel_id: channel.id,
            mention: mention_mod,
          },
        ]);
      }
      client.youtube_list.push({
        guild_id: interaction.guildId,
        youtube_channel_id: YoutubeLookupData,
        youtube_user: youtube_user,
        channel_id: channel.id,
        mention: mention_mod,
        last_posted_date: Date.now(),
        last_video_ids: [],
      });
      return interaction.reply({
        embeds: [
          client.SuccessEmbed("Successfully added the youtube user!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.options.getSubcommand() === "list") {
      let youtube_notifications = [];
      for (let i = 0; i < client.youtube_list.length; i++) {
        if (client.youtube_list[i].guild_id === interaction.guildId) {
          youtube_notifications.push(client.youtube_list[i]);
        }
      }
      if (youtube_notifications.length === 0) {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, "You haven't got any youtube user!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      let temp_text = "";
      for (let i = 0; i < youtube_notifications.length; i++) {
        temp_text += `**\[${i}\]** ${youtube_notifications[i].youtube_user} <#${youtube_notifications[i].channel_id}> \n`;
      }
      interaction.reply(temp_text);
    }
    if (interaction.options.getSubcommand() === "delete") {
      if (await guildSettings.settings_db.exists("/youtube")) {
        let feed_id = options.getInteger("id", true);
        let youtube_notifications = client.youtube_list.filter(
          (x) => x.guild_id === interaction.guildId,
        );
        if (youtube_notifications.length - 1 < feed_id) {
          return interaction.reply({
            embeds: [
              client.ErrorEmbed(lang.error_title, "You entered a bad id."),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        if (youtube_notifications.length === 1) {
          await guildSettings.settings_db.delete("/youtube");
        } else {
          let db_data = await guildSettings.settings_db.getData("/youtube");
          for (let a = 0; a < db_data.length; a++) {
            if (
              db_data[a].channel_id === youtube_notifications[feed_id].channel_id &&
              db_data[a].youtube_user === youtube_notifications[feed_id].youtube_user
            ) {
              db_data.splice(a, 1);
              break;
            }
          }
          await guildSettings.settings_db.push("/youtube", db_data);
        }
        for (let a = 0; a < client.youtube_list.length; a++) {
          if (
            client.youtube_list[a].channel_id === youtube_notifications[feed_id].channel_id &&
            client.youtube_list[a].youtube_user === youtube_notifications[feed_id].youtube_user
          ) {
            client.youtube_list.splice(a, 1);
            break;
          }
        }
        return interaction.reply({
          embeds: [
            client.SuccessEmbed("You successfully deleted the target stream!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, "You haven't got any stream to delete!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    }
    if (interaction.options.getSubcommand() === "delete-all") {
      if (await guildSettings.settings_db.exists("/youtube")) {
        await guildSettings.settings_db.delete("/youtube");
        client.youtube_list = client.youtube_list.filter((x) => x.guild_id !== interaction.guildId);
        return interaction.reply({
          embeds: [
            client.SuccessEmbed("Successfully removed all streams!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, "You haven't got any streams to delete!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  } else {
    return interaction.reply({
      embeds: [
        client.ErrorEmbed(lang.error_title, "You are not authorized to use this command!"),
      ],
      flags: MessageFlags.Ephemeral,
    });
  }
});

module.exports = command;
