const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder, InteractionContextType } = require("discord.js");
const ms = require("ms");

const command = new SlashCommand()
  .setName("seek")
  .setDescription("Seek to a specific time in the current song.")
  .setNameLocalizations({
    hu: "ugrás",
  })
  .setDescriptionLocalizations({
    hu: "Egy pozícióra ugrás a éppen szóló dalban.",
  })
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option) =>
    option
      .setName("time")
      .setDescription("Seek to time you want. Ex 1h 30m | 2h | 80m | 53s")
      .setNameLocalizations({
        hu: "idő",
      })
      .setDescriptionLocalizations({
        hu: "Mely időre akarsz ugrani. pl.:1h 30m | 2h | 80m | 53s.",
      })
      .setRequired(true),
  )
  .setRun(async (client, interaction, options) => {
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
    if (client.playerLimiter.take(interaction.guild.id)) {
      client.log(
        `${interaction.guildId} | User hit the rate limit on the player: ${interaction.user.username}(${interaction.member.id}).`,
      );
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.please_wait_button),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    let channel = await client.getChannel(client, interaction);
    if (!channel) {
      return;
    }

    let player;
    if (client.manager) {
      player = client.manager.getPlayer(interaction.guild.id);
    } else {
      return interaction.reply({
        embeds: [
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.lavalink_not_connected),
        ],
      });
    }

    if (!player) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.no_music_playing),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply();

    const rawArgs = interaction.options.getString("time").trim();
    const args = rawArgs.split(" ");
    var rawTime = [];
    for (let i = 0; i < args.length; i++) {
      rawTime.push(ms(args[i]));
    }
    const time = rawTime.reduce((a, b) => a + b, 0);
    const position = player.position;
    const duration = player.queue.current.info.duration;

    if (time <= duration) {
      player.seek(time);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription(
              `⏩ | **${player.queue.current.info.title}** ${lang.seek_msg1} ${
                time < position ? lang.seek_msg2 : lang.seek_msg3
              } ${lang.seek_msg4} **${ms(time)}**`,
            ),
        ],
      });
    } else {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder().setColor(client.config.embedColor).setDescription(lang.unable_to_seek),
        ],
      });
    }
  });

module.exports = command;
