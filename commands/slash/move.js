import SlashCommand from "../../lib/SlashCommand.js";
import { EmbedBuilder, InteractionContextType, MessageFlags } from "discord.js";

const command = new SlashCommand()
  .setName("move")
  .setDescription("Moves track to a different position")
  .setNameLocalizations({
    hu: "mozgatás",
  })
  .setDescriptionLocalizations({
    hu: "Egy bizonyos dalt elmozgat egy másik pozícióba.",
  })
  .setContexts(InteractionContextType.Guild)
  .addIntegerOption((option) =>
    option
      .setName("track")
      .setDescription("The track number to move")
      .setNameLocalizations({
        hu: "dal_azonosító",
      })
      .setDescriptionLocalizations({
        hu: "A dal azonosítója a várólistán.",
      })
      .setRequired(true),
  )
  .addIntegerOption((option) =>
    option
      .setName("position")
      .setDescription("The position to move the track to")
      .setNameLocalizations({
        hu: "pozíció",
      })
      .setDescriptionLocalizations({
        hu: "Mely pozícióba kerüljön a várólistán?",
      })
      .setRequired(true),
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
    const track = interaction.options.getInteger("track");
    const position = interaction.options.getInteger("position");

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
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.nothing_playing),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    let trackNum = Number(track) - 1;
    if (trackNum < 0 || trackNum > player.queue.tracks.length - 1) {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.invalid_track_number),
        ],
      });
    }

    let dest = Number(position) - 1;
    if (dest < 0 || dest > player.queue.tracks.length - 1) {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.invalid_position_number),
        ],
      });
    }
    if (dest === trackNum) {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.same_position),
        ],
      });
    }
    const thing = player.queue.tracks[trackNum];
    player.queue.splice(trackNum, 1);
    player.queue.add(thing, dest);
    // player.queue.splice(trackNum, 1);
    //player.queue.splice(dest, 0, thing);
    return interaction.reply({
      embeds: [
        new EmbedBuilder().setColor(client.config.embedColor).setDescription(lang.moved_position),
      ],
    });
  });

export default command;
