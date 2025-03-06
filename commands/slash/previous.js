const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder, InteractionContextType } = require("discord.js");

const command = new SlashCommand()
  .setName("previous")
  .setDescription("Go back to the previous song.")
  .setNameLocalizations({
    hu: "előző",
  })
  .setDescriptionLocalizations({
    hu: "Visszaugrik a bot az előző számra.",
  })
  .setContexts(InteractionContextType.Guild)
  .setRun(async (client, interaction) => {
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
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.no_previous_songs),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (player.queue.previous.length === 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.no_previous_songs2),
        ],
      });
    }

    const track = player.queue.previous.shift();
    player.queue.add(track, 0);
    player.LavalinkManager.once("trackEnd", (player) => {
      player.queue.add(player.queue.previous.shift(), 0);
    });
    player.skip(false);

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setDescription(`${lang.previous_song} **${track.info.title}**`),
      ],
    });
  });

module.exports = command;
