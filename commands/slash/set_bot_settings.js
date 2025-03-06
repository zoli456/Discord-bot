const {
  EmbedBuilder,
  ActivityType,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionContextType,
  MessageFlags,
} = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");
const schedule = require("node-schedule");
const fs = require("fs");
const { encode } = require("@msgpack/msgpack");
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");

const command = new SlashCommand()
  .setName("set")
  .setDescription("Change the bot's settings")
  .setContexts(InteractionContextType.Guild)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("presence")
      .setDescription("Change the bot's presence")
      .addStringOption((option) =>
        option
          .setName("bot_status")
          .setDescription("The bot status")
          .setRequired(true)
          .addChoices(
            { name: "Online", value: "online" },
            { name: "Idle", value: "idle" },
            { name: "Do Not Disturb", value: "dnd" },
            { name: "Offline", value: "offline" },
          ),
      )
      .addStringOption((option2) =>
        option2
          .setName("activity_type")
          .setDescription("The activity type")
          .setRequired(true)
          .addChoices(
            { name: "Playing", value: "Playing" },
            { name: "Streaming", value: "Streaming" },
            { name: "Listening", value: "Listening" },
            { name: "Watching", value: "Watching" },
            { name: "Custom", value: "Custom" },
            { name: "Competing", value: "Competing" },
          ),
      )

      .addStringOption((option3) =>
        option3
          .setName("activity_message")
          .setDescription("The activity message.")
          .setRequired(true),
      ),
  );
command.addSubcommand((subcommand) =>
  subcommand
    .setName("media_channel")
    .setDescription("Set the servers media channel.")
    .addChannelOption((channel) => {
      return channel
        .setName("media_channel_name")
        .setDescription("The bot only accept media request from this channel.")
        .addChannelTypes(ChannelType.GuildText);
    }),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("temp_channels")
    .setDescription("Set the temp channels.")
    .addChannelOption((channel) => {
      return channel
        .setName("temp_channel")
        .setDescription("The channel where you need to enter")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildVoice);
    })
    .addStringOption((option2) =>
      option2
        .setName("scheme")
        .setDescription("Naming scheme")
        .setRequired(false)
        .addChoices({ name: "Name", value: "Name" }, { name: "Number", value: "Number" }),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("log_channel")
    .setDescription("Set the log channel.")
    .addChannelOption((channel) => {
      return channel
        .setName("log_channel")
        .setDescription("The channel for the logs.")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText);
    }),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("counter_channel")
    .setDescription("Set the counter channel.")
    .addChannelOption((option) => {
      return option
        .setName("counter_voice_channel")
        .setDescription("The channel for the member counter")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildVoice);
    })
    .addStringOption((option2) =>
      option2
        .setName("counter_naming")
        .setDescription("Naming scheme. It must contain the substitute {i}.")
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("gamestat_channel")
    .setDescription("Set the game counter channel.")
    .addChannelOption((option) => {
      return option
        .setName("voice_channel")
        .setDescription("The channel for the member counter")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildVoice);
    })
    .addStringOption((option2) =>
      option2
        .setName("scheme")
        .setDescription("Naming scheme. It must contain the substitute {i}.")
        .setRequired(false),
    )
    .addStringOption((option3) =>
      option3.setName("game").setDescription("Name the game.").setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("nameday_channel")
    .setDescription("Set the nameday channels.")
    .addChannelOption((channel) => {
      return channel
        .setName("nameday_channel")
        .setDescription("The channel where where the bot send the message")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText);
    }),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("game_channel")
    .setDescription("Set the game channel.")
    .addChannelOption((channel) => {
      return channel
        .setName("game_channel_name")
        .setDescription("The channel for the games.")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText);
    }),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("word_game")
    .setDescription("Set the word game channel.")
    .addChannelOption((channel) => {
      return channel
        .setName("word_game_channel")
        .setDescription("The channel for the word game.")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText);
    })
    .addIntegerOption((option3) =>
      option3.setName("length").setDescription("How many words the game need.").setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("voice_controller")
    .setDescription("Set the word controller channel.")
    .addChannelOption((channel) => {
      return channel
        .setName("voice_controller_channel")
        .setDescription("The channel for the voice controller.")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText);
    })
    .addRoleOption((option3) =>
      option3
        .setName("base_role")
        .setDescription("Set the base role for the voice controller.")
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("welcome_text")
    .setDescription("Set the welcome text.")
    .addStringOption((option1) =>
      option1
        .setName("text")
        .setMinLength(2)
        .setMaxLength(100)
        .setDescription("Text scheme for the welcome text. {n} = name {s} = server")
        .setRequired(false),
    )
    .addChannelOption((option2) =>
      option2
        .setName("channel")
        .setDescription("The bot will send it to this channel.")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("welcome_image")
    .setDescription("Set the welcome image.")
    .addStringOption((option1) =>
      option1
        .setName("text1")
        .setMinLength(2)
        .setMaxLength(50)
        .setDescription("First line on the card. {s} = server name, {n} = nickname")
        .setRequired(false),
    )
    .addStringOption((option1) =>
      option1
        .setName("text2")
        .setMinLength(2)
        .setMaxLength(50)
        .setDescription("Last line on the card. {s} = server name")
        .setRequired(false),
    )
    .addChannelOption((option2) =>
      option2
        .setName("channel")
        .setDescription("The bot will send it to this channel.")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText),
    )
    .addStringOption((option3) =>
      option3
        .setName("background")
        .setMinLength(2)
        .setMaxLength(300)
        .setDescription("Image for the background.")
        .setRequired(false),
    )
    .addStringOption((option4) =>
      option4
        .setName("text_color")
        .setMinLength(7)
        .setMaxLength(7)
        .setDescription("Hex value for the text color.")
        .setRequired(false),
    )
    .addStringOption((option5) =>
      option5
        .setName("profile_border_color")
        .setMinLength(7)
        .setMaxLength(7)
        .setDescription("Hex value for the profile border color.")
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("leave_text")
    .setDescription("Set the leave text.")
    .addStringOption((option1) =>
      option1
        .setName("text")
        .setMinLength(2)
        .setMaxLength(100)
        .setDescription("Text scheme for the leave text. {n} = name {s} = server")
        .setRequired(false),
    )
    .addChannelOption((option2) =>
      option2
        .setName("channel")
        .setDescription("The bot will send it to this channel.")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("countdown_channel")
    .setDescription("Enable countdown channel.")
    .addStringOption((option1) =>
      option1
        .setName("date")
        .setMinLength(2)
        .setMaxLength(20)
        .setDescription("Target date ex.:2020.01.01")
        .setRequired(false),
    )
    .addStringOption((option2) =>
      option2
        .setName("time")
        .setMinLength(2)
        .setMaxLength(20)
        .setDescription("Target date ex.: 1:00")
        .setRequired(false),
    )
    .addChannelOption((option3) =>
      option3
        .setName("channel")
        .setDescription("Channel for the countdown.")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildVoice),
    )
    .addStringOption((option4) =>
      option4
        .setName("scheme")
        .setMinLength(2)
        .setMaxLength(50)
        .setDescription("Scheme of the channel naming. ex.: New year: {i}")
        .setRequired(false),
    )
    .addStringOption((option5) =>
      option5
        .setName("end_text")
        .setMinLength(2)
        .setMaxLength(20)
        .setDescription("It display this text when the time is up.")
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("picture")
    .setDescription("Change the bot's picture")
    .addAttachmentOption((option) =>
      option.setName("image").setDescription("The bot's image").setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("banner")
    .setDescription("Change the bot's banner.")
    .addAttachmentOption((option) =>
      option.setName("image").setDescription("The bot's banner.").setRequired(true),
    ),
);

command.setRun(async (client, interaction, options) => {
  const _db = client.guild_settings.find((e) => e.guildId === interaction.guildId);
  let settingsDb = await _db.settings_db.getData("/");
  const lang = client.localization_manager.getLanguage(settingsDb.language);
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
  if (interaction.options.getSubcommand() === "presence") {
    if (interaction.user.id === process.env.ADMINID) {
      let bot_status = interaction.options.getString("bot_status");
      let activity_type = interaction.options.getString("activity_type");
      let activity_message = interaction.options.getString("activity_message");

      // create a new embed
      let filtersEmbed = new EmbedBuilder().setColor(client.config.embedColor);

      if (activity_type === "Playing") {
        activity_type = ActivityType.Playing;
      } else if (activity_type === "Streaming") {
        activity_type = ActivityType.Streaming;
      } else if (activity_type === "Listening") {
        activity_type = ActivityType.Listening;
      } else if (activity_type === "Watching") {
        activity_type = ActivityType.Watching;
      } else if (activity_type === "Custom") {
        activity_type = ActivityType.Custom;
      } else if (activity_type === "Competing") {
        activity_type = ActivityType.Competing;
      } else {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("❌ | Invalid data!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      client.config.presence.status = bot_status;
      client.user.setPresence({
        status: bot_status,
        activities: [
          {
            name: activity_message,
            type: activity_type,
          },
        ],
      });
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription("✅ | Successfully set!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "media_channel") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      const media_channel = interaction.options.getChannel("media_channel_name", false);
      if (media_channel) {
        let config = {};
        config.media_channel_id = media_channel.id;
        await _db.settings_db.push("/media_channel", config);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully set to <#" + media_channel.id + ">!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await _db.settings_db.delete("/media_channel");
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully removed the media channel!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "temp_channels") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      let temp_channel = interaction.options.getChannel("temp_channel", false);
      let scheme = options.getString("scheme", false);
      if (!temp_channel || !scheme) {
        client.tempChannelsmanager.unregisterChannel(settingsDb.temp_channel.temp_channel_id);
        await _db.settings_db.delete("/temp_channel");
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | You removed the temp channel."),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        let config = {};
        config.temp_channel_id = temp_channel.id;
        config.temp_channel_parentId = temp_channel.parentId;
        config.temp_channel_scheme = scheme;
        await client.setup_tempchannel(config, temp_channel.guild);
        await _db.settings_db.push("/temp_channel", config);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(
                "✅ | The temp channel successfully set to <#" + temp_channel.id + ">!",
              ),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "log_channel") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      let log_channel = interaction.options.getChannel("log_channel", false);
      if (log_channel) {
        let config = {};
        config.log_channel_id = log_channel.id;
        await _db.settings_db.push("/log_channel", config);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(`✅ | The log channel successfully set to <#${log_channel.id}>!`),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await _db.settings_db.delete("/log_channel");
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(`✅ | The log channel successfully removed!`),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "counter_channel") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      let counter_channel = interaction.options.getChannel("counter_voice_channel", false);
      let channel_scheme = interaction.options.getString("counter_naming", false);
      const guild = await client.guilds.fetch(interaction.guildId);
      if (counter_channel && channel_scheme) {
        if (await _db.settings_db.exists("/counter_channel")) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | You already enabled on this server!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        if (channel_scheme.split("{i}").length !== 2) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | Bad input!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        if (
          settingsDb.gamestat_channel &&
          settingsDb.gamestat_channel.gamestat_channel_id === counter_channel.id.toString()
        ) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | You already enabled gamestat channel on this channel!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        if (
          settingsDb.countdown_channel &&
          settingsDb.countdown_channel.countdown_channel_id === counter_channel.id.toString()
        ) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | You already enabled countdown channel on this channel!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }

        let config = {};
        config.counter_channel_id = counter_channel.id;
        config.counter_channel_scheme = channel_scheme;
        config.counter_channel_prev_value = -1;
        await _db.settings_db.push("/counter_channel", config);

        await client.setup_counter_channel(guild);

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(
                `✅ | Online counter channel successfully set to <#${counter_channel.id}>!`,
              ),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await _db.settings_db.delete("/counter_channel");
        let current_job = schedule.scheduledJobs[`${interaction.guildId}_counter`];
        if (current_job) {
          current_job.cancel();
        }

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(`✅ | Online counter successfully removed!`),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "gamestat_channel") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      let gamestat_channel = interaction.options.getChannel("voice_channel", false);
      let scheme = interaction.options.getString("scheme", false);
      let game = interaction.options.getString("game", false);
      if (gamestat_channel && scheme && game) {
        if (await _db.settings_db.exists("/gamestat_channel")) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | You already enabled on this server!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        if (scheme.split("{i}").length !== 2) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | Bad input!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        const guild = await client.guilds.fetch(interaction.guildId);
        if (
          settingsDb.counter_channel &&
          settingsDb.counter_channel.counter_channel_id === gamestat_channel.id.toString()
        ) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | You already enabled counter channel on this channel!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        if (
          settingsDb.countdown_channel &&
          settingsDb.countdown_channel.countdown_channel_id === gamestat_channel.id.toString()
        ) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | You already enabled countdown channel on this channel!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }

        let config = {};
        config.gamestat_channel_id = gamestat_channel.id;
        config.gamestat_channel_scheme = scheme;
        config.gamestat_channel_game = game;
        config.gamestat_channel_prev_value = -1;
        await _db.settings_db.push("/gamestat_channel", config);

        client.setup_gamestat_channel(guild);

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(
                `✅ | Game counter channel successfully set to <#${gamestat_channel.id}>!`,
              ),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await _db.settings_db.delete("/gamestat_channel");
        let current_job = schedule.scheduledJobs[`${interaction.guildId}_gamestat`];
        if (current_job) {
          current_job.cancel();
        }
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(`✅ | Game counter successfully removed!`),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "nameday_channel") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      let nameday_channel = interaction.options.getChannel("nameday_channel", false);
      if (nameday_channel) {
        if (await _db.settings_db.exists("/nameday_channel")) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | You already enabled on this server!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        let config = {};
        config.nameday_channel_id = nameday_channel.id;
        await _db.settings_db.push("/nameday_channel", config);
        client.nameday_channels.push(config.nameday_channel_id);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(
                `✅ | The nameday channel successfully set to <#${nameday_channel.id}>!`,
              ),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        if (!(await _db.settings_db.exists("/nameday_channel"))) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | This channel isn't registered!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        const index = client.nameday_channels.indexOf(
          settingsDb.nameday_channel.nameday_channel_id,
        );
        client.nameday_channels.splice(index, 1);

        await _db.settings_db.delete("/nameday_channel");

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(`✅ | The nameday channel successfully removed!`),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "game_channel") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      const game_channel = interaction.options.getChannel("game_channel_name", false);
      if (game_channel) {
        let config = {};
        config.game_channel_id = game_channel.id;
        await _db.settings_db.push("/game_channel", config);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully set to <#" + game_channel.id + ">!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await _db.settings_db.delete("/game_channel");
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully removed the game channel!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "word_game") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      const word_game_channel = interaction.options.getChannel("word_game_channel", false);
      const word_game_length = interaction.options.getInteger("length", false);
      if (word_game_channel && word_game_length) {
        let game_channel = client.channels.cache.get(word_game_channel.id);
        const word_game = client.wordgame_status.find((e) => e.guildId === interaction.guildId);
        if (word_game) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | You have already activated the word game!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        let config = {};
        config.word_game_channel_id = word_game_channel.id;
        config.word_game_length = word_game_length;
        await client.setupWordgame(interaction.guild, lang, word_game_channel).then(async (msg) => {
          config.word_game_msg_id = msg.id;
          await _db.settings_db.push("/word_game", config);
          await msg.pin();
        });
        client.wordgame_status.push({
          guildId: interaction.guild.id,
          chain: "0",
          total_correct: "0",
          last_correct: "-",
          longest_word: "-",
          last_correct_author: "-",
          longest_author: "-",
          used_word: [],
        });
        if (!fs.existsSync(`./info/wordgame/${interaction.guildId}_wordgame.json`)) {
          const word_game = client.wordgame_status.find((e) => e.guildId === interaction.guildId);
          await fs.writeFile(
            `./info/wordgame/${interaction.guildId}_wordgame.json`,
            encode(word_game),
            null,
            function writeJSON(err) {
              if (err) return console.log(err);
            },
          );
        }

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully enabled the word game!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        if (!settingsDb.word_game) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | You have already disabled the wordgame."),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        const word_game_pos = client.wordgame_status
          .map((e) => e.guildId)
          .indexOf(interaction.guildId);
        if (word_game_pos !== -1) {
          client.wordgame_status.splice(word_game_pos, 1);
        }

        const channel = client.channels.cache.get(settingsDb.word_game.word_game_channel_id);
        await channel.messages.fetchPinned().then((pinnedMessages) => {
          pinnedMessages.each(async (msg) => {
            try {
              await msg.unpin();
              await msg.delete();
            } catch (e) {}
          });
        });
        await _db.settings_db.delete("/word_game");
        if (fs.existsSync(`./info/wordgame/${interaction.guildId}_wordgame.json`)) {
          fs.unlinkSync(`./info/wordgame/${interaction.guildId}_wordgame.json`);
        }
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully removed the word game channel!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "voice_controller") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      const voice_controller_channel = interaction.options.getChannel(
        "voice_controller_channel",
        false,
      );
      const base_role = interaction.options.getRole("base_role", false);

      if (voice_controller_channel && base_role) {
        if (!(await _db.settings_db.exists("/voice_controller"))) {
          let config = {};
          config.voice_controller_channel_id = interaction.channel.id;
          config.voice_controller_base_role_id = base_role.id;
          await _db.settings_db.push("/voice_controller", config);
          voice_controller_channel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle(lang.temp_channel_control_panel)
                .setDescription(lang.temp_channel_control_panel_description)
                .addFields(
                  {
                    name: lang.temp_channel_hide,
                    value: `👻`,
                    inline: true,
                  },
                  {
                    name: lang.temp_channel_unhide,
                    value: `👁️`,
                    inline: true,
                  },
                  {
                    name: lang.temp_channel_lock,
                    value: `🔒`,
                    inline: true,
                  },
                  {
                    name: lang.temp_channel_unlock,
                    value: `🔓`,
                    inline: true,
                  },
                  {
                    name: lang.temp_channel_kick,
                    value: `👢`,
                    inline: true,
                  },
                  {
                    name: lang.temp_channel_ban,
                    value: `☠️`,
                    inline: true,
                  },
                  {
                    name: lang.temp_channel_claim,
                    value: `👑`,
                    inline: true,
                  },
                  {
                    name: lang.temp_channel_limit,
                    value: `🤏`,
                    inline: true,
                  },
                  {
                    name: lang.temp_channel_rename,
                    value: `✍️`,
                    inline: true,
                  },
                  {
                    name: lang.temp_channel_permit,
                    value: lang.temp_channel_permit_description,
                    inline: true,
                  },
                ),
            ],
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId(`voice_controller:${interaction.guildId}:Hide`)
                  .setEmoji("👻"),
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId(`voice_controller:${interaction.guildId}:Unhide`)
                  .setEmoji("👁️"),
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId(`voice_controller:${interaction.guildId}:Lock`)
                  .setEmoji("🔒"),
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId(`voice_controller:${interaction.guildId}:Unlock`)
                  .setEmoji("🔓"),
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId(`voice_controller:${interaction.guildId}:Kick`)
                  .setEmoji("👢"),
              ), new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId(`voice_controller:${interaction.guildId}:Ban`)
                  .setEmoji("☠️"),
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId(`voice_controller:${interaction.guildId}:Rename`)
                  .setEmoji("✍️"),
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId(`voice_controller:${interaction.guildId}:Limit`)
                  .setEmoji("🤏"),
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId(`voice_controller:${interaction.guildId}:Claim`)
                  .setEmoji("👑"),
              ),
            ],
          });
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("✅ | You enabled the voice controller channel."),
            ],
            flags: MessageFlags.Ephemeral,
          });
        } else {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | Already enabled the voice controller channel."),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
      } else {
        await _db.settings_db.delete("/voice_controller");
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | You removed the voice controller channel."),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "welcome_text") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      const welcome_channel = interaction.options.getChannel("channel", false);
      const welcome_text = interaction.options.getString("text", false);
      if (welcome_channel && welcome_text) {
        let config = {};
        config.welcome_channel_id = welcome_channel.id;
        config.welcome_text = welcome_text;
        await _db.settings_db.push("/welcome_text", config);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(
                "✅ | Successfully enabled the welcome text in <#" + welcome_channel.id + ">!",
              ),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await _db.settings_db.delete("/welcome_text");
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully removed the welcome text!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "welcome_image") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      const welcome_channel = interaction.options.getChannel("channel", false);
      const welcome_text1 = interaction.options.getString("text1", false);
      const welcome_text2 = interaction.options.getString("text2", false);
      const welcome_background = interaction.options.getString("background", false);
      const text_color = interaction.options.getString("text_color", false);
      const profile_border_color = interaction.options.getString("profile_border_color", false);

      if (welcome_channel && welcome_text1 && welcome_text2) {
        let config = {};
        config.welcome_channel_id = welcome_channel.id;
        config.welcome_text1 = welcome_text1;
        config.welcome_text2 = welcome_text2;
        config.welcome_background = welcome_background;
        config.welcome_text_color = text_color;
        config.welcome_profile_border_color = profile_border_color;
        await _db.settings_db.push("/welcome_image", config);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(
                "✅ | Successfully enabled the welcome image in <#" + welcome_channel.id + ">!",
              ),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await _db.settings_db.delete("/welcome_image");
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully removed the welcome image!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "leave_text") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      const leave_channel = interaction.options.getChannel("channel", false);
      const leave_text = interaction.options.getString("text", false);
      if (leave_channel && leave_text) {
        let config = {};
        config.leave_channel_id = leave_channel.id;
        config.leave_channel_leave_text = leave_text;
        await _db.settings_db.push("/leave_text", config);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(
                "✅ | Successfully enabled the leave text in <#" + leave_channel.id + ">!",
              ),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await _db.settings_db.delete("/leave_text");
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | Successfully removed the leave text!"),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "countdown_channel") {
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      const countdown_channel = interaction.options.getChannel("channel", false);
      const channel_scheme = interaction.options.getString("scheme", false);
      const date = interaction.options.getString("date", false);
      const time = interaction.options.getString("time", false);
      const end_text = interaction.options.getString("end_text", false);

      const guild = await client.guilds.fetch(interaction.guildId);
      if (countdown_channel && channel_scheme && date && time && end_text) {
        if (await _db.settings_db.exists("/countdown_channel")) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | You already enabled on this server!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        if (
          channel_scheme.split("{i}").length !== 2 ||
          time.split(":").length !== 2 ||
          date.split(".").length !== 3 ||
          !moment(moment(`${date} ${time}`, "YYYY.MM.DD H:m")).isAfter(moment(), "minute")
        ) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | Bad input!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        if (
          settingsDb.counter_channel &&
          settingsDb.counter_channel.counter_channel_id === countdown_channel.id.toString()
        ) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | You already enabled counter channel on this channel!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        if (
          settingsDb.gamestat_channel &&
          settingsDb.gamestat_channel.gamestat_channel_id === countdown_channel.id.toString()
        ) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | You already enabled gamestat channel on this channel!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        let config = {};
        config.countdown_channel_id = countdown_channel.id;
        config.countdown_channel_scheme = channel_scheme;
        config.countdown_channel_date = date;
        config.countdown_channel_time = time;
        config.countdown_channel_end_text = end_text;
        config.countdown_channel_prev_value = 0;
        await _db.settings_db.push("/countdown_channel", config);

        await client.setup_countdown_channel(guild);

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(
                `✅ | Countdown channel successfully set to <#${countdown_channel.id}>!`,
              ),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await _db.settings_db.delete("/countdown_channel");
        let current_job = schedule.scheduledJobs[`${interaction.guildId}_countdown`];
        if (current_job) {
          current_job.cancel();
        }

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(`✅ | Countdown channel successfully removed!`),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "picture") {
    if (interaction.user.id === process.env.ADMINID) {
      let image = interaction.options.getAttachment("image");
      await interaction.deferReply();
      await client.user.setAvatar(image.url);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription(`✅ | You successfully set the bot's image`),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
  if (interaction.options.getSubcommand() === "banner") {
    if (interaction.user.id === process.env.ADMINID) {
      let image = interaction.options.getAttachment("image");
      await interaction.deferReply();
      //await client.users.edit.user.options.setBanner(image.url);
      await client.user.setBanner(image.url);
      /* await client.rest.patch("/users/@me", {
        body: {
          banner:
            "data:image/gif;base64," +
            Buffer.from(await (await fetch(image.url)).arrayBuffer()).toString(
              "base64",
            ),
        },
      });*/
      //await client.user.setBanner(image.url);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription(`✅ | You successfully set the bot's banner.`),
        ],
        flags: MessageFlags.Ephemeral,
      });
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

module.exports = command;
