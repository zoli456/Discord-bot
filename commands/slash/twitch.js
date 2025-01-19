const {
  ChannelType,
  InteractionContextType,
  PermissionsBitField,
} = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("twitch")
  .setDescription("Twitch stream notifications.")
  .setContexts(InteractionContextType.Guild)
  .setNameLocalizations({
    hu: "twitch",
  })
  .setDescriptionLocalizations({
    hu: "Twitch stream értesítések.",
  });
command.addSubcommand((subcommand) =>
  subcommand
    .setName("add")
    .setDescription("Add a Twitch user.")
    .setNameLocalizations({
      hu: "hozzáadás",
    })
    .setDescriptionLocalizations({
      hu: "Hozzáad egy Twitch felhasználót a listához.",
    })
    .addStringOption((option) =>
      option
        .setName("twitch_user")
        .setDescription("Twitch user to watch.")
        .setAutocomplete(false)
        .setMinLength(2)
        .setMaxLength(128)
        .setNameLocalizations({
          hu: "twitch_felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Twitch felhasználó neve.",
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
        .addChoices(
          { name: "Everyone", value: "@everyone" },
          { name: "Here", value: "@here" },
        )
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
    .setDescription("List the Twitch notifications for the current guild.")
    .setNameLocalizations({
      hu: "lista",
    })
    .setDescriptionLocalizations({
      hu: "Kilistázza a Twitch értesítseket a jelenlegi szerveren.",
    }),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("delete")
    .setDescription("Delete a Twitch notification.")
    .setNameLocalizations({
      hu: "törlés",
    })
    .setDescriptionLocalizations({
      hu: "Kikapcsol egy Twitch értesítést a szerveren.",
    })
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("Id of the Twitch notification.")
        .setAutocomplete(false)
        .setMinValue(0)
        .setMaxValue(4)
        .setNameLocalizations({
          hu: "id",
        })
        .setDescriptionLocalizations({
          hu: "Twitch értesítést azonosítója.",
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
      hu: "Kikapcsolja az összes stream értesítést a szerveren.",
    }),
);
command.setRun(async (client, interaction, options) => {
  const guildSettings = client.guild_settings.find(
    (e) => e.guildId === interaction.guildId,
  );
  const lang = client.localization_manager.getLanguage(
    await guildSettings.settings_db.getData("/language"),
  );
  if (client.commandLimiter.take(interaction.member.id)) {
    client.log(
      `${interaction.guild.name}(${interaction.guildId}) | User hit the rate limit: ${interaction.user.username}(${interaction.member.id}).`,
    );
    return interaction.reply({
      embeds: [client.ErrorEmbed(lang.error_title, lang.please_wait_between)],
      flags: MessageFlags.Ephemeral,
    });
  }
  if (
    await client.is_it_word_game_channel(interaction.channel, guildSettings)
  ) {
    return interaction.reply({
      embeds: [client.ErrorEmbed(lang.error_title, lang.cant_use_it_here)],
      flags: MessageFlags.Ephemeral,
    });
  }
  if (
    interaction.memberPermissions.has(
      PermissionsBitField.Flags.Administrator,
    ) ||
    interaction.user.id === process.env.ADMINID
  ) {
    if (interaction.options.getSubcommand() === "add") {
      let twitch_user = options.getString("twitch_user", true).trim();
      let mention = options.getRole("mention", false);
      let mass_mention = options.getString("mass_mention", false);
      let channel = options.getChannel("channel", true);
      for (let i = 0; i < client.twitch_list.length; i++) {
        if (
          client.twitch_list[i].channel_id === channel.id &&
          client.twitch_list[i].twitch_user === twitch_user
        ) {
          return interaction.reply({
            embeds: [client.ErrorEmbed(lang.error_title, "This a duplicate.")],
            flags: MessageFlags.Ephemeral,
          });
        }
      }
      if (
        client.twitch_list.filter((x) => x.guild_id === interaction.guildId)
          .length >= 4
      ) {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(
              lang.error_title,
              "You reached the limit(3) feeds on this server.",
            ),
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
      if (await guildSettings.settings_db.exists("/twitch")) {
        const temp = await guildSettings.settings_db.getData("/twitch");
        temp.push({
          twitch_user: twitch_user,
          channel_id: channel.id,
          mention: mention_mod,
        });
        await guildSettings.settings_db.push("/twitch", temp);
      } else {
        await guildSettings.settings_db.push("/twitch", [
          {
            twitch_user: twitch_user,
            channel_id: channel.id,
            mention: mention_mod,
          },
        ]);
      }
      client.twitch_list.push({
        guild_id: interaction.guildId,
        twitch_user: twitch_user,
        channel_id: channel.id,
        mention: mention_mod,
        last_status: "",
      });
      return interaction.reply({
        embeds: [client.SuccessEmbed("Successfully added the stream!")],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.options.getSubcommand() === "list") {
      let twitch_notifications = [];
      for (let i = 0; i < client.twitch_list.length; i++) {
        if (client.twitch_list[i].guild_id === interaction.guildId) {
          twitch_notifications.push(client.twitch_list[i]);
        }
      }
      if (twitch_notifications.length === 0) {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, "You haven't got any stream!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      let temp_text = "";
      for (let i = 0; i < twitch_notifications.length; i++) {
        temp_text += `**\[${i}\]** ${twitch_notifications[i].twitch_user} <#${twitch_notifications[i].channel_id}> \n`;
      }
      interaction.reply(temp_text);
    }
    if (interaction.options.getSubcommand() === "delete") {
      if (await guildSettings.settings_db.exists("/twitch")) {
        let feed_id = options.getInteger("id", true);
        let twitch_notifications = client.twitch_list.filter(
          (x) => x.guild_id === interaction.guildId,
        );
        if (twitch_notifications.length - 1 < feed_id) {
          return interaction.reply({
            embeds: [
              client.ErrorEmbed(lang.error_title, "You entered a bad id."),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        if (twitch_notifications.length === 1) {
          await guildSettings.settings_db.delete("/twitch");
        } else {
          let db_data = await guildSettings.settings_db.getData("/twitch");
          for (let a = 0; a < db_data.length; a++) {
            if (
              db_data[a].channel_id ===
                twitch_notifications[feed_id].channel_id &&
              db_data[a].twitch_user ===
                twitch_notifications[feed_id].twitch_user
            ) {
              db_data.splice(a, 1);
              break;
            }
          }
          await guildSettings.settings_db.push("/twitch", db_data);
        }
        for (let a = 0; a < client.twitch_list.length; a++) {
          if (
            client.twitch_list[a].channel_id ===
              twitch_notifications[feed_id].channel_id &&
            client.twitch_list[a].twitch_user ===
              twitch_notifications[feed_id].twitch_user
          ) {
            client.twitch_list.splice(a, 1);
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
            client.ErrorEmbed(
              lang.error_title,
              "You haven't got any stream to delete!",
            ),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    }
    if (interaction.options.getSubcommand() === "delete-all") {
      if (await guildSettings.settings_db.exists("/twitch")) {
        await guildSettings.settings_db.delete("/twitch");
        client.twitch_list = client.twitch_list.filter(
          (x) => x.guild_id !== interaction.guildId,
        );
        return interaction.reply({
          embeds: [client.SuccessEmbed("Successfully removed all streams!")],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(
              lang.error_title,
              "You haven't got any streams to delete!",
            ),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  } else {
    return interaction.reply({
      embeds: [
        client.ErrorEmbed(
          lang.error_title,
          "You are not authorized to use this command!",
        ),
      ],
      flags: MessageFlags.Ephemeral,
    });
  }
});

module.exports = command;
