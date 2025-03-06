const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder, InteractionContextType } = require("discord.js");

const command = new SlashCommand()
  .setName("volume")
  .setDescription("Change the volume of the current song.")
  .setNameLocalizations({
    hu: "hangerő",
  })
  .setDescriptionLocalizations({
    hu: "Beállítja a zene hangerejét.",
  })
  .setContexts(InteractionContextType.Guild)
  .addNumberOption((option) =>
    option
      .setName("amount")
      .setDescription("Amount of volume you want to change. Ex: 10")
      .setNameLocalizations({
        hu: "mérték",
      })
      .setDescriptionLocalizations({
        hu: "Mennyire állítsam a hangerőt?.",
      })
      .setRequired(false),
  )
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

    let vol = interaction.options.getNumber("amount");
    if (!vol || vol < 1 || vol > 125) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription(`${lang.current_volume} **${player.volume}**`),
        ],
      });
    }

    player.setVolume(vol);
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setDescription(`${lang.set_volume} **${player.volume}**`),
      ],
    });
  });

module.exports = command;
