import { EmbedBuilder, InteractionContextType, escapeMarkdown, MessageFlags } from "discord.js";
import SlashCommand from "../../lib/SlashCommand.js";
import prettyMilliseconds from "pretty-ms";

const command = new SlashCommand()
  .setName("nowplaying")
  .setDescription("Shows the song currently playing in the voice channel.")
  .setNameLocalizations({
    hu: "most_megy",
  })
  .setDescriptionLocalizations({
    hu: "Kiírja, hogy éppen mit játszik le a bot.",
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
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.isnt_in_channel),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!player.playing) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.nothing_playing),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const song = player.queue.current;
    var title = escapeMarkdown(song.info.title);
    var title = title.replace(/\]/g, "");
    var title = title.replace(/\[/g, "");
    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setAuthor({ name: lang.now_playing, iconURL: client.config.iconURL })
      // show who requested the song via setField, also show the duration of the song
      .setFields([
        {
          name: lang.requested_by,
          value: `${song.requester}`, //player.queue.current.requester
          inline: true,
        }, {
          // show duration, if live show live
          name: lang.duration,
          value: song.info.isStream
            ? lang.LIVE
            : `\`${prettyMilliseconds(player.position, {
                secondsDecimalDigits: 0,
              })} / ${prettyMilliseconds(song.info.duration, {
                secondsDecimalDigits: 0,
              })}\``,
          inline: true,
        },
      ])
      // show the thumbnail of the song using displayThumbnail("maxresdefault")
      .setThumbnail(song.info.artworkUrl)
      // show the title of the song and link to it
      .setDescription(`[${title}](${song.info.uri})`);
    return interaction.reply({
      embeds: [
        embed,
      ],
    });
  });
export default command;
