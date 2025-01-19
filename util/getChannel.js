/**
 *
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {import("discord.js").GuildCommandInteraction} interaction
 * @returns
 */
const { MessageFlags } = require("discord.js");
module.exports = async (client, interaction) => {
  return new Promise(async (resolve) => {
    const guildSettings = client.guild_settings.find(
      (e) => e.guildId === interaction.guildId,
    );
    const lang = client.localization_manager.getLanguage(
      await guildSettings.settings_db.getData("/language"),
    );

    if (
      !(await client.is_it_media_channel(interaction.channel, guildSettings))
    ) {
      const temp = await guildSettings.settings_db.getData("/media_channel");
      await interaction.reply({
        embeds: [
          client.WarningEmbed(
            lang.warning_title,
            lang.cant_use_in_this_channel.replace(
              "%channel%",
              temp.media_channel_id,
            ),
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return resolve(false);
    }

    if (
      guildSettings.word_game &&
      guildSettings.word_game.word_game_channel_id === interaction.channelId
    ) {
      interaction.reply({
        embeds: [client.ErrorEmbed(lang.error_title, lang.cant_use_it_here)],
        flags: MessageFlags.Ephemeral,
      });
      return resolve(false);
    }

    if (!interaction.member.voice.channel) {
      await interaction.reply({
        embeds: [client.WarningEmbed(lang.warning_title, lang.you_must_be_in)],
        flags: MessageFlags.Ephemeral,
      });
      return resolve(false);
    }
    if (
      interaction.guild.members.me.voice.channel &&
      interaction.member.voice.channel.id !==
        interaction.guild.members.me.voice.channel.id
    ) {
      await interaction.reply({
        embeds: [client.WarningEmbed(lang.warning_title, lang.you_must_same)],
        flags: MessageFlags.Ephemeral,
      });
      return resolve(false);
    }
    if (!interaction.member.voice.channel.joinable) {
      await interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.not_enough_permission),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return resolve(false);
    }
    if (
      interaction.guild.afkChannelId &&
      interaction.guild.afkChannelId === interaction.member.voice.channel.id
    ) {
      interaction.reply({
        embeds: [client.ErrorEmbed(lang.error_title, lang.cant_play_in_afk)],
        flags: MessageFlags.Ephemeral,
      });
      return resolve(false);
    }

    resolve(interaction.member.voice.channel);
  });
};
