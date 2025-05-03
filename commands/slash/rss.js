import { PermissionsBitField, InteractionContextType, ChannelType, MessageFlags } from "discord.js";
import SlashCommand from "../../lib/SlashCommand.js";

const command = new SlashCommand()
  .setName("rss")
  .setDescription("parse rss")
  .setContexts(InteractionContextType.Guild)
  .setNameLocalizations({
    hu: "rss",
  })
  .setDescriptionLocalizations({
    hu: "parse rss",
  });
command.addSubcommand((subcommand) =>
  subcommand
    .setName("add")
    .setDescription("Add a feed.")
    .setNameLocalizations({
      hu: "hozzáadás",
    })
    .setDescriptionLocalizations({
      hu: "Hozzáad egy feedet a listához.",
    })
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Url of the feed.")
        .setAutocomplete(false)
        .setMinLength(2)
        .setMaxLength(1024)
        .setNameLocalizations({
          hu: "url",
        })
        .setDescriptionLocalizations({
          hu: "Forrás url-je.",
        })
        .setRequired(true),
    )
    .addChannelOption((option2) =>
      option2
        .setName("channel")
        .setDescription("Post the feed into this channel.")
        .setNameLocalizations({
          hu: "csatorna",
        })
        .setDescriptionLocalizations({
          hu: "Ebbe a csatornába menti a bejegyzéseket.",
        })
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("list")
    .setDescription("List the feeds for the current guild.")
    .setNameLocalizations({
      hu: "lista",
    })
    .setDescriptionLocalizations({
      hu: "Kilistázza a hírcsatornákat a jelenlegi szerverhez.",
    }),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("delete")
    .setDescription("Delete a feed.")
    .setNameLocalizations({
      hu: "törlés",
    })
    .setDescriptionLocalizations({
      hu: "Töröl egy hírcsatornát a szerverről.",
    })
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("Id of the feed.")
        .setAutocomplete(false)
        .setMinValue(0)
        .setMaxValue(4)
        .setNameLocalizations({
          hu: "id",
        })
        .setDescriptionLocalizations({
          hu: "A forrás azonosítója.",
        })
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("delete-all")
    .setDescription("Delete all feeds from the guild.")
    .setNameLocalizations({
      hu: "mind-törlése",
    })
    .setDescriptionLocalizations({
      hu: "Törölni az összes hírcsatornát a szerverről.",
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
      let url = options.getString("url", true).trim();
      let channel = options.getChannel("channel", true);
      if (!client.isUrl(url)) {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, "The url isn't valid!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      for (let i = 0; i < client.feed_list.length; i++) {
        if (client.feed_list[i].channel_id === channel.id && client.feed_list[i].url === url) {
          return interaction.reply({
            embeds: [
              client.ErrorEmbed(lang.error_title, "This a duplicate."),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
      }
      if (client.feed_list.filter((x) => x.guild_id === interaction.guildId).length >= 5) {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed("You reached the limit(4) feeds on this server."),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      if (await guildSettings.settings_db.exists("/rss")) {
        const temp = await guildSettings.settings_db.getData("/rss");
        temp.push({ url: url, channel_id: channel.id });
        await guildSettings.settings_db.push("/rss", temp);
      } else {
        await guildSettings.settings_db.push("/rss", [
          {
            url: url,
            channel_id: channel.id,
          },
        ]);
      }
      client.feed_list.push({
        guild_id: interaction.guildId,
        url: url,
        channel_id: channel.id,
        last_date: Date.now(),
        last_titles: [],
        post_number: 0,
      });
      return interaction.reply({
        embeds: [
          client.SuccessEmbed("Successfully added the feed!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.options.getSubcommand() === "list") {
      let temp_feeds = [];
      for (let i = 0; i < client.feed_list.length; i++) {
        if (client.feed_list[i].guild_id === interaction.guildId) {
          temp_feeds.push(client.feed_list[i]);
        }
      }
      if (temp_feeds.length === 0) {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, "You haven't got any feeds!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      let temp_text = "";
      for (let i = 0; i < temp_feeds.length; i++) {
        temp_text += `**\[${i}\]** ${temp_feeds[i].url} <#${temp_feeds[i].channel_id}> 50/${temp_feeds[i].post_number}\n`;
      }
      interaction.reply(temp_text);
    }
    if (interaction.options.getSubcommand() === "delete") {
      if (await guildSettings.settings_db.exists("/rss")) {
        let feed_id = options.getInteger("id", true);
        let temp_feeds = client.feed_list.filter((x) => x.guild_id === interaction.guildId);
        if (temp_feeds.length - 1 < feed_id) {
          return interaction.reply({
            embeds: [
              client.ErrorEmbed(lang.error_title, "You entered a bad id."),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        if (temp_feeds.length === 1) {
          await guildSettings.settings_db.delete("/rss");
        } else {
          let db_data = await guildSettings.settings_db.getData("/rss");
          for (let a = 0; a < db_data.length; a++) {
            if (
              db_data[a].channel_id === temp_feeds[feed_id].channel_id &&
              db_data[a].url === temp_feeds[feed_id].url
            ) {
              db_data.splice(a, 1);
              break;
            }
          }
          await guildSettings.settings_db.push("/rss", db_data);
        }
        for (let a = 0; a < client.feed_list.length; a++) {
          if (
            client.feed_list[a].channel_id === temp_feeds[feed_id].channel_id &&
            client.feed_list[a].url === temp_feeds[feed_id].url
          ) {
            client.feed_list.splice(a, 1);
            break;
          }
        }
        return interaction.reply({
          embeds: [
            client.SuccessEmbed("You successfully deleted the target feed!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, "You haven't got any feeds to delete!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    }
    if (interaction.options.getSubcommand() === "delete-all") {
      if (await guildSettings.settings_db.exists("/rss")) {
        /* await guildSettings.settings_db.delete("/rss");
        for (let i = 0; i < client.feed_list.length; i++) {
          if (client.feed_list[i].guild_id === interaction.guildId) {
            client.feed_list = client.feed_list.splice(i, 1);
          }
        }*/
        await guildSettings.settings_db.delete("/rss");
        client.feed_list = client.feed_list.filter((x) => x.guild_id !== interaction.guildId);
        return interaction.reply({
          embeds: [
            client.SuccessEmbed("Successfully removed all feeds!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, "You haven't got any feeds to delete!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  } else {
    return interaction.reply({
      embeds: [
        client.ErrorEmbed("You are not authorized to use this command!"),
      ],
      flags: MessageFlags.Ephemeral,
    });
  }
});

export default command;
