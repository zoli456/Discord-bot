const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
  InteractionContextType,
} = require("discord.js");
const colors = require("@colors/colors");

module.exports = {
  command: new ContextMenuCommandBuilder()
    .setName("Permit")
    .setNameLocalizations({
      hu: "Beenged",
    })
    .setType(ApplicationCommandType.User)
    .setContexts(InteractionContextType.Guild),
  /**
   * This function will handle context menu interaction
   * @param {import("../lib/DiscordMusicBot")} client
   * @param {import("discord.js").GuildContextMenuInteraction} interaction
   */
  run: async (client, interaction, options) => {
    if (interaction.targetUser.id === client.config.clientId) returnn;
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
    if (!interaction.member.voice.channel) {
      return interaction
        .reply({
          embeds: [
            client.WarningEmbed(lang.warning_title, lang.you_must_be_action),
          ],
          flags: MessageFlags.Ephemeral,
        })
        .then((msg) => {
          setTimeout(() => msg.delete(), 20000);
        });
    }
    const index = client.tempchannel_owners
      .map(function (element) {
        return element.channelID;
      })
      .indexOf(interaction.member.voice.channel.id);
    if (index === -1) {
      return interaction
        .reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, lang.temp_channel_not_tempchannel),
          ],
          flags: MessageFlags.Ephemeral,
        })
        .then((msg) => {
          setTimeout(() => msg.delete(), 20000);
        });
    }
    if (interaction.user.id !== client.tempchannel_owners[index].owner) {
      return interaction
        .reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, lang.temp_channel_not_yours),
          ],
          flags: MessageFlags.Ephemeral,
        })
        .then((msg) => {
          setTimeout(() => msg.delete(), 20000);
        });
    }
    await interaction.member.voice.channel.permissionOverwrites.edit(interaction.targetUser.id, {
      Connect: true,
      ViewChannel: true,
    });
    client.logger.log(
      `${colors.blue(interaction.guild.name)}(${interaction.guild.id}) 🔑 ${colors.blue(interaction.user.username)}(${interaction.user.id}) gave access to ${colors.red(interaction.targetUser.username)}(${interaction.targetUser.id}) to his channel.`,
    );
    return interaction
      .reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#228B22")
            .setDescription(
              lang.temp_channel_successful_permit.replace(
                "{target}",
                `<@${interaction.targetUser.id}>`,
              ),
            ),
        ],
        flags: MessageFlags.Ephemeral,
      })
      .then((msg) => {
        setTimeout(() => msg.delete(), 20000);
      });
  },
};
