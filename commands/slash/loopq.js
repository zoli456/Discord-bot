import SlashCommand from "../../lib/SlashCommand.js";
import { EmbedBuilder, InteractionContextType, MessageFlags } from "discord.js";

const command = new SlashCommand()
  .setName("loopq")
  .setDescription("Loop the current song queue")
  .setNameLocalizations({
    hu: "ismétlés_lista",
  })
  .setDescriptionLocalizations({
    hu: "Beállítja, hogy a bot ismételje a teljes várólistát.",
  })
  .setContexts(InteractionContextType.Guild)
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

    if (player.repeatMode === "queue") {
      player.setRepeatMode("off");
    } else {
      player.setRepeatMode("queue");
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setDescription(
            `:thumbsup: | **${lang.loop_queue_is_now} \`${
              player.queueRepeat ? lang.enabled : lang.disabled
            }\`**`,
          ),
      ],
    });
  });

export default command;
