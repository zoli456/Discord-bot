import SlashCommand from "../../lib/SlashCommand.js";
import {
  EmbedBuilder,
  InteractionContextType,
  MessageFlags,
  PermissionsBitField,
} from "discord.js";

const command = new SlashCommand()
  .setName("clean")
  .setDescription("Cleans the last 100 bot messages from channel.")
  .setNameLocalizations({
    hu: "tisztítás",
  })
  .setDescriptionLocalizations({
    hu: "Törli az utolsó 100 üzenetet amit a bot küldött.",
  })
  .addIntegerOption((option) =>
    option
      .setName("number")
      .setDescription("Number of messages to delete.")
      .setMinValue(2)
      .setMaxValue(100)
      .setRequired(false)
      .setNameLocalizations({
        hu: "szám",
      })
      .setDescriptionLocalizations({
        hu: "Hány üzenetet töröljek?",
      }),
  )
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
      await interaction.deferReply();
      let number = interaction.options.getInteger("number");
      number = number && number < 100 ? ++number : 100;
      interaction.channel.messages
        .fetch({
          limit: number,
        })
        .then((messages) => {
          const botMessages = [];
          messages
            .filter((m) => m.author.id === client.user.id)
            .forEach((msg) => botMessages.push(msg));
          botMessages.shift();
          interaction.channel.bulkDelete(botMessages, true).then(async (deletedMessages) => {
            //Filtering out messages that did not get deleted.
            messages = messages.filter((msg) => {
              !deletedMessages.some((deletedMsg) => deletedMsg == msg);
            });
            if (messages.size > 0) {
              client.log(`${lang.deleting} [${messages.size}] ${lang.deleting2}.`);
              for (const msg of messages) {
                await msg.delete();
              }
            }

            await interaction.editReply({
              embeds: [
                client.Embed(
                  `:white_check_mark: | ${lang.deleted} ${botMessages.length} ${lang.bot_messages}`,
                ),
              ],
            });
            setTimeout(() => {
              interaction.deleteReply();
            }, 5000);
          });
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
