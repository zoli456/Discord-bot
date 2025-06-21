import {
  EmbedBuilder,
  ActivityType,
  ChannelType,
  PermissionFlagsBits,
  ButtonStyle,
  InteractionContextType,
  MessageFlags,
  PermissionsBitField,
} from "discord.js";
import SlashCommand from "../../lib/SlashCommand.js";
import schedule from "node-schedule";

const command = new SlashCommand()
  .setName("openspy")
  .setDescription("Rename a voice channel based on game server stats")
  .setContexts(InteractionContextType.Guild)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addStringOption((option) =>
    option.setName("game").setDescription("Game identifier (e.g., legendsmm)").setRequired(false),
  )
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("Voice channel to rename")
      .setRequired(false)
      .addChannelTypes(ChannelType.GuildVoice),
  )
  .addStringOption((option) =>
    option.setName("pattern").setDescription("Custom pattern e.g. Players: {n}").setRequired(false),
  )
  .setRun(async (client, interaction) => {
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

    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      let openspy_game = interaction.options.getString("game", false);
      let openspy_channel = interaction.options.getChannel("channel", false);
      let openspy_scheme = interaction.options.getString("pattern", false);
      const guild = await client.guilds.fetch(interaction.guildId);
      if (openspy_channel && openspy_scheme && openspy_game) {
        if (await _db.settings_db.exists("/openspy_channel")) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | You already enabled on this server!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        if (openspy_scheme.split("{n}").length !== 2) {
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
          settingsDb.gamestat_channel.gamestat_channel_id === openspy_channel.id.toString()
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
          settingsDb.countdown_channel.countdown_channel_id === openspy_channel.id.toString()
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
        config.openspy_channel_id = openspy_channel.id;
        config.openspy_channel_scheme = openspy_scheme;
        config.openspy_channel_game = openspy_game;
        await _db.settings_db.push("/openspy_channel", config);

        await client.setup_openspy_channel(guild);

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(
                `✅ | Openspy counter channel successfully set to <#${openspy_channel.id}>!`,
              ),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await _db.settings_db.delete("/openspy_channel");
        let current_job = schedule.scheduledJobs[`${interaction.guildId}_openspy`];
        if (current_job) {
          current_job.cancel();
        }

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(`✅ | Openspy counter successfully removed!`),
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
  });

export default command;
