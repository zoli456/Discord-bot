import {
  EmbedBuilder,
  InteractionContextType,
  PermissionsBitField,
  ChannelType,
  MessageFlags,
} from "discord.js";

import SlashCommand from "../../lib/SlashCommand.js";
const command = new SlashCommand()
  .setName("automod")
  .setDescription("Changing the automod settings on the server.")
  .setContexts(InteractionContextType.Guild)
  .setNameLocalizations({
    hu: "automod",
  })
  .setDescriptionLocalizations({
    hu: "Az automod beállításainak módosítása.",
  });
command.addSubcommand((subcommand) =>
  subcommand
    .setName("invite")
    .setDescription("Auto delete invites.")
    .setNameLocalizations({
      hu: "meghívó",
    })
    .setDescriptionLocalizations({
      hu: "Törli a meghívókat.",
    })
    .addStringOption((option1) =>
      option1
        .setName("punishment")
        .setDescription("Punishment for posting Discord invited.")
        .setAutocomplete(false)
        .setRequired(true)
        .addChoices(
          { name: "None", value: "none" },
          { name: "Delete", value: "delete" },
          { name: "Timeout for 1 min", value: "timeout 1" },
          { name: "Timeout for 3 min", value: "timeout 3" },
          { name: "Timeout for 5 min", value: "timeout 5" },
          { name: "Timeout for 10 min", value: "timeout 10" },
          { name: "Timeout for 30 min", value: "timeout 30" },
          { name: "Timeout for 1 hour", value: "timeout 60" },
          { name: "Timeout for 2 hours", value: "timeout 120" },
          { name: "Timeout for 6 hours", value: "timeout 360" },
          { name: "Timeout for 12 hours", value: "timeout 720" },
          { name: "Timeout for 1 day", value: "timeout 1440" },
          { name: "Kick", value: "kick" },
          { name: "Ban", value: "ban" },
        )
        .setNameLocalizations({
          hu: "büntetés",
        })
        .setDescriptionLocalizations({
          hu: "Büntetés a Discord meghívók posztolásárért.",
        }),
    )
    .addStringOption((option2) =>
      option2
        .setName("method")
        .setDescription("Method for filtering Discord invites.")
        .setAutocomplete(false)
        .setRequired(false)
        .addChoices({ name: "Fast", value: "fast" }, { name: "Accurate", value: "accurate" })
        .setNameLocalizations({
          hu: "mód",
        })
        .setDescriptionLocalizations({
          hu: "Szűrési eljárás.",
        }),
    )
    .addStringOption((option3) =>
      option3
        .setName("ignored_role")
        .setDescription("Ignored role seperated with ;")
        .setMaxLength(3)
        .setMaxLength(512)
        .setNameLocalizations({
          hu: "kivétel_szerep",
        })
        .setDescriptionLocalizations({
          hu: "Ezzel a szereppel rendelkező felhasználóknak nem törli a meghívóit ; elválasztva",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("names")
    .setDescription("Enable or disable the name checker.")
    .addBooleanOption((option1) =>
      option1.setName("enabled").setDescription("Enable or Disable.").setRequired(true),
    )
    .addStringOption((option2) =>
      option2
        .setName("ignored_role")
        .setDescription("Ignored roles seperated with ;")
        .setMaxLength(3)
        .setMaxLength(512)
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("messages")
    .setDescription("Enable or disable the message checker.")
    .addStringOption((option2) =>
      option2
        .setName("method")
        .setDescription("How to censor messages?")
        .setRequired(true)
        .addChoices(
          { name: "None", value: "none" },
          { name: "Delete", value: "delete" },
          { name: "Replace", value: "replace" },
        ),
    )
    .addStringOption((option3) =>
      option3
        .setName("ignored_role")
        .setDescription("Ignored role.")
        .setMaxLength(3)
        .setMaxLength(512)
        .setRequired(false),
    )
    .addStringOption((option4) =>
      option4
        .setName("ignored_channel")
        .setDescription("Ignored channel.")
        .setRequired(false)
        .setMaxLength(3)
        .setMaxLength(512),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("link")
    .setDescription(
      "Check the messages for fishing or ip logger links. Link shorteners will always be deleted.",
    )
    .setNameLocalizations({
      hu: "link",
    })
    .setDescriptionLocalizations({
      hu: "Adathalász vagy ip rögzítő linkek után kutat. Link rövidítőket mindig törli.",
    })
    .addStringOption((option1) =>
      option1
        .setName("punishment")
        .setDescription("Punishment for posting bad links.")
        .setAutocomplete(false)
        .setRequired(true)
        .addChoices(
          { name: "None", value: "none" },
          { name: "Delete", value: "delete" },
          { name: "Timeout for 1 min", value: "timeout 1" },
          { name: "Timeout for 3 min", value: "timeout 3" },
          { name: "Timeout for 5 min", value: "timeout 5" },
          { name: "Timeout for 10 min", value: "timeout 10" },
          { name: "Timeout for 30 min", value: "timeout 30" },
          { name: "Timeout for 1 hour", value: "timeout 60" },
          { name: "Timeout for 2 hours", value: "timeout 120" },
          { name: "Timeout for 6 hours", value: "timeout 360" },
          { name: "Timeout for 12 hours", value: "timeout 720" },
          { name: "Timeout for 1 day", value: "timeout 1440" },
          { name: "Kick", value: "kick" },
          { name: "Ban", value: "ban" },
        )
        .setNameLocalizations({
          hu: "büntetés",
        })
        .setDescriptionLocalizations({
          hu: "Büntetés a linkek posztolásárért.",
        }),
    )
    .addStringOption((option2) =>
      option2
        .setName("ignored_role")
        .setDescription("Ignored role.")
        .setMaxLength(3)
        .setMaxLength(512)
        .setNameLocalizations({
          hu: "kivétel_szerep",
        })
        .setDescriptionLocalizations({
          hu: "Ezzel a szereppel rendelkező felhasználóknak nem vizsgálja meg az üzeneteit.",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("settings")
    .setDescription("Settings for the current guild.")
    .setNameLocalizations({
      hu: "beállítások",
    })
    .setDescriptionLocalizations({
      hu: "Kiírja a beállíátsait s jelenlegi szervernek.",
    })
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
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("spam")
    .setDescription("Enable or disable the spam checker.")
    .addStringOption((option1) =>
      option1
        .setName("punishment")
        .setDescription("Punishment for spamming.")
        .setAutocomplete(false)
        .setRequired(true)
        .addChoices(
          { name: "None", value: "none" },
          { name: "Timeout", value: "timeout" },
          { name: "Kick", value: "kick" },
          { name: "Ban", value: "ban" },
        )
        .setNameLocalizations({
          hu: "büntetés",
        })
        .setDescriptionLocalizations({
          hu: "Büntetés spamelésért.",
        }),
    )
    .addStringOption((option2) =>
      option2
        .setName("ignored_roles")
        .setDescription("Ignored roles seperated with ;")
        .setRequired(false)
        .setMaxLength(3)
        .setMaxLength(512)
        .setNameLocalizations({
          hu: "kihagyott_szerepek",
        })
        .setDescriptionLocalizations({
          hu: "Ezeket a szerepeket nem vizsgálja ; elválasztva.",
        }),
    )
    .addStringOption((option3) =>
      option3
        .setName("ignored_channels")
        .setDescription("Ignored channels seperated with ;")
        .setRequired(false)
        .setMaxLength(3)
        .setMaxLength(512)
        .setNameLocalizations({
          hu: "kihagyott_csatornák",
        })
        .setDescriptionLocalizations({
          hu: "Ezeket a csatornákat nem vizsgálja ; elválasztva..",
        }),
    )
    .addBooleanOption((option4) =>
      option4
        .setName("show_warning")
        .setDescription("Enable or Disable the warning message.")
        .setRequired(false)
        .setNameLocalizations({
          hu: "figyelmeztetés_mutatás",
        })
        .setDescriptionLocalizations({
          hu: "Megadja, hogy mutasson-e figyelmezteséket a felhasználóknak.",
        }),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("trap_channel")
    .setDescription("Enable or disable the trap channel.")
    .addChannelOption((option1) =>
      option1
        .setName("channel")
        .setDescription("The trap channel.")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText)
        .setNameLocalizations({
          hu: "csatorna",
        })
        .setDescriptionLocalizations({
          hu: "Ebbe a csatornába nem szabad üzenetet küldeni.",
        }),
    )
    .addStringOption((option2) =>
      option2
        .setName("punishment")
        .setDescription("Punishment for typing in the trap channel.")
        .setAutocomplete(false)
        .setRequired(false)
        .addChoices({ name: "Kick", value: "kick" }, { name: "Ban", value: "ban" })
        .setNameLocalizations({
          hu: "büntetés",
        })
        .setDescriptionLocalizations({
          hu: "Büntetés ha írsz a csapda csatornába.",
        }),
    ),
);
command.setRun(async (client, interaction) => {
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
  if (
    interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
    interaction.user.id === process.env.ADMINID
  ) {
    if (interaction.options.getSubcommand() === "invite") {
      const punishment = interaction.options.getString("punishment", true);
      let ignored_role = interaction.options.getString("ignored_role", false);
      let method = interaction.options.getString("method", false);
      if (!method) method = "fast";
      if (ignored_role) {
        ignored_role = ignored_role.trim().split(";");
      } else {
        ignored_role = [];
      }
      let config = {};
      config.ignored_role = ignored_role;
      config.punishment = punishment;
      config.method = method;
      if (punishment !== "none") {
        await guildSettings.settings_db.push("/automod_invite", config);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully enabled the Automod for Discord invites!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await guildSettings.settings_db.delete("/automod_invite");
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | You disabled the Automod for Discord invites!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      return;
    }
  } else {
    return interaction.reply({
      embeds: [
        client.ErrorEmbed(lang.error_title, "You are not authorized to use this command!"),
      ],
      flags: MessageFlags.Ephemeral,
    });
  }
  if (interaction.options.getSubcommand() === "names") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      let enabled = interaction.options.getBoolean("enabled", true);
      let ignored_role = interaction.options.getString("ignored_role", false);
      if (ignored_role) {
        ignored_role = ignored_role.trim().split(";");
      } else {
        ignored_role = [];
      }
      if (enabled) {
        let config = {};
        config.ignored_role = ignored_role;
        await guildSettings.settings_db.push("/automod_names", config);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully enabled the Automod for names!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await guildSettings.settings_db.delete("/automod_names");
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully removed the Automod for names!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription("❌ | You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "messages") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      let censor_method = interaction.options.getString("method", true);
      let ignored_role = interaction.options.getString("ignored_role", false);
      let ignored_channel = interaction.options.getString("ignored_channel", false);
      if (ignored_role) {
        ignored_role = ignored_role.trim().split(";");
      } else {
        ignored_role = [];
      }
      if (ignored_channel) {
        ignored_channel = ignored_channel.trim().split(";");
      } else {
        ignored_channel = [];
      }
      if (censor_method !== "none") {
        let config = {};
        config.censoring_method = censor_method;
        config.ignored_role = ignored_role;
        config.ignored_channel = ignored_channel;
        await guildSettings.settings_db.push("/automod_messages", config);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully enabled the Automod for messages!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await guildSettings.settings_db.delete("/automod_messages");
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully removed the Automod for messages!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription("❌ | You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "link") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      const punishment = interaction.options.getString("punishment", true);
      let ignored_role = interaction.options.getString("ignored_role", false);
      if (ignored_role) {
        ignored_role = ignored_role.trim().split(";");
      } else {
        ignored_role = [];
      }
      let config = {};
      config.ignored_role = ignored_role;
      config.punishment = punishment;
      if (punishment !== "none") {
        await guildSettings.settings_db.push("/automod_links", config);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully enabled the Automod for links!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await guildSettings.settings_db.delete("/automod_links");
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | You disabled the Automod for links!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription("❌ | You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "settings") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      const guildSettings = client.guild_settings.find((e) => e.guildId === interaction.guildId);
      const guild_settings = await guildSettings.settings_db.getData("/");
      let hidden_answer = interaction.options.getBoolean("hidden", false);
      if (!hidden_answer) hidden_answer = false;
      let settingsEmbed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`Automod settings for \`${interaction.guild.name}\` guild`)
        .setTimestamp()
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        });
      if (guild_settings.automod_invite) {
        settingsEmbed.addFields({
          name: "Invite filtering:  Enabled",
          value: `Punishment: ${guild_settings.automod_invite.punishment}
            Method: ${guild_settings.automod_invite.method}
            Ignored role: ${guild_settings.automod_invite.ignored_role.join("\n")}`,
          inline: true,
        });
      } else {
        settingsEmbed.addFields({
          name: "Invite filtering:  Disabled",
          value: `No settings`,
          inline: true,
        });
      }
      if (guild_settings.automod_names) {
        settingsEmbed.addFields({
          name: "Name filtering:  Enabled",
          value: `Ignored role: ${guild_settings.automod_names.ignored_role.map((value) => `<@&${value}>`).join("\n")}`,
          inline: true,
        });
      } else {
        settingsEmbed.addFields({
          name: "Name filtering:  Disabled",
          value: `No settings`,
          inline: true,
        });
      }
      if (guild_settings.automod_messages) {
        settingsEmbed.addFields({
          name: "Message filtering:  Enabled",
          value: `Censoring method: ${guild_settings.automod_messages.censoring_method}
            Ignored role: ${guild_settings.automod_messages.ignored_role ? guild_settings.automod_messages.ignored_role.map((value) => `<@&${value}>`).join("\n") : "-"}
            Ignored channel: ${guild_settings.automod_messages.ignored_channel ? guild_settings.automod_messages.ignored_channel.map((value) => `<#${value}>`).join("\n") : "-"}`,
          inline: true,
        });
      } else {
        settingsEmbed.addFields({
          name: "Message filtering:  Disabled",
          value: `No settings`,
          inline: true,
        });
      }
      if (guild_settings.automod_links) {
        settingsEmbed.addFields({
          name: "Link filtering:  Enabled",
          value: `Punishment: ${guild_settings.automod_links.punishment}
            Ignored role: ${guild_settings.automod_links.ignored_role ? guild_settings.automod_links.ignored_role.map((value) => `<@&${value}>`).join("\n") : "-"}`,
          inline: true,
        });
      } else {
        settingsEmbed.addFields({
          name: "Link filtering:  Disabled",
          value: `No settings`,
          inline: true,
        });
      }
      if (guild_settings.automod_spam) {
        settingsEmbed.addFields({
          name: "Spam filtering:  Enabled",
          value: `Punishment: ${guild_settings.automod_spam.punishment}
            Ignored role: ${guild_settings.automod_spam.ignored_roles ? guild_settings.automod_spam.ignored_roles.map((value) => `<@&${value}>`).join("\n") : "-"}
            Ignored channel: ${guild_settings.automod_spam.ignored_channels ? guild_settings.automod_spam.ignored_channels.map((value) => `<#${value}>`).join("\n") : "-"}
            Show warning: ${guild_settings.automod_spam.show_warning}`,
          inline: true,
        });
      } else {
        settingsEmbed.addFields({
          name: "Spam filtering:  Disabled",
          value: `No settings`,
          inline: true,
        });
      }
      if (guild_settings.automod_trap_channel) {
        settingsEmbed.addFields({
          name: "Trap channel:  Enabled",
          value: `Punishment: ${guild_settings.automod_trap_channel.punishment}
            Channel: <#${guild_settings.automod_trap_channel.channel}>`,
          inline: true,
        });
      } else {
        settingsEmbed.addFields({
          name: "Trap channel:  Disabled",
          value: `No settings`,
          inline: true,
        });
      }
      if (hidden_answer) {
        interaction.reply({
          embeds: [
            settingsEmbed,
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        interaction.reply({
          embeds: [
            settingsEmbed,
          ],
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription("❌ | You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "spam") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      const guildSettings = client.guild_settings.find((e) => e.guildId === interaction.guildId);
      let punishment = interaction.options.getString("punishment", true);
      if (punishment !== "none") {
        let ignored_roles = interaction.options.getString("ignored_roles", false);
        let ignored_channels = interaction.options.getString("ignored_channels", false);
        let show_warning = interaction.options.getBoolean("show_warning", false);
        if (show_warning === null) show_warning = true;
        if (ignored_channels) {
          ignored_channels = ignored_channels.trim().split(";");
        } else {
          ignored_channels = [];
        }
        if (ignored_roles) {
          ignored_roles = ignored_roles.trim().split(";");
        } else {
          ignored_roles = [];
        }
        let config = {};
        config.punishment = punishment;
        config.ignored_roles = ignored_roles;
        config.ignored_channels = ignored_channels;
        config.show_warning = show_warning;
        await guildSettings.settings_db.push("/automod_spam", config);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully enabled the Automod for spam!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await guildSettings.settings_db.delete("/automod_spam");
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | You disabled the Automod for spam!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription("❌ | You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "trap_channel") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      let channel = interaction.options.getChannel("channel", false);
      let punishment = interaction.options.getString("punishment", false);
      if (channel && punishment) {
        let config = {};
        config.channel_id = channel.id;
        config.punishment = punishment;
        if (punishment === "kick") {
          await channel.send(lang.trap_channel_kick);
        } else {
          await channel.send(lang.trap_channel_ban);
        }
        await guildSettings.settings_db.push("/automod_trap_channel", config);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully enabled the Automod for the trap channel!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await guildSettings.settings_db.delete("/automod_trap_channel");
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully removed the Automod for the trap channel!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription("❌ | You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});
export default command;
