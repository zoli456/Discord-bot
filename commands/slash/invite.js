const {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  InteractionContextType,
} = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("invite")
  .setDescription("Invite me to your server")
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
    if (await client.is_it_word_game_channel(interaction.channel, guildSettings)) {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.cant_use_it_here),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    return interaction.reply({
      embeds: [
        new EmbedBuilder().setColor(client.config.embedColor).setTitle(`Invite me to your server!`),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Invite me")
            .setStyle(ButtonStyle.Link)
            .setURL(
              `https://discord.com/oauth2/authorize?client_id=${
                client.config.clientId
              }&permissions=${client.config.permissions}&scope=${client.config.inviteScopes
                .toString()
                .replace(/,/g, "%20")}`,
            ),
        ),
      ],
    });
  });
module.exports = command;
