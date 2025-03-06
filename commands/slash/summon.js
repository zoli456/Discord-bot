const SlashCommand = require("../../lib/SlashCommand");
const { InteractionContextType, MessageFlags, PermissionsBitField } = require("discord.js");

const command = new SlashCommand()
  .setName("summon")
  .setDescription("Summons the bot to the channel.")
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
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      let channel = await client.getChannel(client, interaction);
      if (!interaction.member.voice.channel) {
        return;
      }

      let player = client.manager.getPlayer(interaction.guild.id);
      if (!player) {
        player = client.createPlayer(interaction.channel, channel);
        await player.connect();
      }

      if (channel.id !== player.voiceChannelId) {
        player.voiceChannelId = channel.id;
        await player.connect();
      }

      interaction.reply({
        embeds: [
          client.Embed(`:thumbsup: | **Successfully joined <#${channel.id}>!**`),
        ],
      });
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  });
module.exports = command;
