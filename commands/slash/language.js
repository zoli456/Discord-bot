import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  PermissionsBitField,
  InteractionContextType,
  MessageFlags,
} from "discord.js";

import SlashCommand from "../../lib/SlashCommand.js";

const command = new SlashCommand()
  .setName("language")
  .setDescription("Change the language of the bot")
  .setNameLocalizations({
    hu: "nyelv",
  })
  .setDescriptionLocalizations({
    hu: "Beállítja a bot nyelvét a szerveren.",
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
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      let buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("English")
          .setCustomId("en")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("🇬🇧"),
        new ButtonBuilder()
          .setLabel("Magyar")
          .setCustomId("hu")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("🇭🇺"),
      );
      let embed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setTitle(lang.select_a_lang)
        .setTimestamp();
      interaction
        ?.reply({
          embeds: [
            embed,
          ],
          components: [
            buttons,
          ],
          flags: MessageFlags.Ephemeral,
        })
        .then(async (Message) => {
          const filter = (i) => i.user.id === interaction?.user?.id;
          let col = await Message.createMessageComponentCollector({
            filter,
            time: 30000,
          });

          col.on("collect", async (button) => {
            if (button.user.id !== interaction?.user?.id) return;
            await guildSettings.settings_db.push("/language", button.customId);

            switch (button.customId) {
              case "hu":
                await interaction
                  ?.editReply({
                    content: `A bot nyelve sikeresen beállítva magyarra. :flag_hu:`,
                    embeds: [],
                    components: [],
                    flags: MessageFlags.Ephemeral,
                  })
                  .catch((e) => {});
                await button?.deferUpdate().catch((e) => {});
                await col?.stop();
                break;

              case "en":
                await interaction
                  ?.editReply({
                    content: `Bot language successfully changed to english. :flag_gb:`,
                    embeds: [],
                    components: [],
                    flags: MessageFlags.Ephemeral,
                  })
                  .catch((e) => {});
                await button?.deferUpdate().catch((e) => {});
                await col?.stop();
                break;
            }
          });
          setTimeout(() => interaction.deleteReply(), 30000);
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
export default command;
