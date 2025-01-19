const SlashCommand = require("../../lib/SlashCommand");
const {
  PermissionsBitField,
  InteractionContextType,
  ChannelType,
} = require("discord.js");
const ms = require("ms");

const command = new SlashCommand()
  .setName("giveaway")
  .setDescription("Manage a giveaways.")
  .setContexts(InteractionContextType.Guild)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("create")
      .setDescription("Create a giveaway")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("It will create the giveaway in this channel.")
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildText),
      )
      .addStringOption((option2) =>
        option2
          .setName("prize")
          .setDescription("It will create the giveaway in this channel.")
          .setRequired(true)
          .setMinLength(2)
          .setMaxLength(50)
          .setAutocomplete(false),
      )
      .addStringOption((option3) =>
        option3
          .setName("duration")
          .setDescription("Length of the giveaway. Ex 1d 1h | 2h | 80m | 53s")
          .setRequired(true)
          .setMinLength(2)
          .setMaxLength(20)
          .setAutocomplete(false),
      )
      .addIntegerOption((option4) =>
        option4
          .setName("winners")
          .setDescription("The maximum number of winners.")
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(9),
      )
      .addUserOption((option5) =>
        option5
          .setName("hosted_by")
          .setDescription("His name will be displayed im the giveaway.")
          .setRequired(false),
      )
      .addAttachmentOption((option6) =>
        option6
          .setName("thumbnail")
          .setDescription("Thumbnail of the giveaway.")
          .setRequired(false),
      )
      .addBooleanOption((option7) =>
        option7
          .setName("drop")
          .setDescription("The fastest win and end at max winners.")
          .setRequired(false),
      ),
  )

  .addSubcommand((subcommand) =>
    subcommand
      .setName("reroll")
      .setDescription("Reroll a giveaway")
      .addStringOption((option) =>
        option
          .setName("message_id")
          .setDescription("It will create the giveaway in this channel.")
          .setRequired(true)
          .setMinLength(2)
          .setMaxLength(20),
      )
      .addIntegerOption((option2) =>
        option2
          .setName("new_winners")
          .setDescription("Reroll with different number of winners.")
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(9),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("edit")
      .setDescription("Edit a giveaway")
      .addStringOption((option) =>
        option
          .setName("message_id")
          .setDescription("Which giveaway you want to edit?")
          .setRequired(true)
          .setMinLength(2)
          .setMaxLength(20),
      )
      .addStringOption((option2) =>
        option2
          .setName("add_time")
          .setDescription("Add time to the giveaway.")
          .setRequired(false)
          .setMinLength(2)
          .setMaxLength(20),
      )
      .addIntegerOption((option3) =>
        option3
          .setName("new_winner_count")
          .setDescription("Change the number of winners.")
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(9),
      )
      .addStringOption((option4) =>
        option4
          .setName("prize")
          .setDescription("Change the prize.")
          .setRequired(false)
          .setMinLength(2)
          .setMaxLength(50),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("delete")
      .setDescription("Delete a giveaway")
      .addStringOption((option) =>
        option
          .setName("message_id")
          .setDescription("Which giveaway you want to delete?")
          .setRequired(true)
          .setMinLength(2)
          .setMaxLength(20),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("end")
      .setDescription("End a giveaway")
      .addStringOption((option) =>
        option
          .setName("message_id")
          .setDescription("Which giveaway you want to end?")
          .setRequired(true)
          .setMinLength(2)
          .setMaxLength(20),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("pause")
      .setDescription("Pause a giveaway")
      .addStringOption((option) =>
        option
          .setName("message_id")
          .setDescription("Which giveaway you want to pause?")
          .setRequired(true)
          .setMinLength(2)
          .setMaxLength(20)
          .setAutocomplete(false),
      )
      .addStringOption((option2) =>
        option2
          .setName("duration")
          .setDescription("Length of the pause. Ex 1d 1h | 2h | 80m | 53s")
          .setRequired(false)
          .setMinLength(2)
          .setMaxLength(20)
          .setAutocomplete(false),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("unpause")
      .setDescription("Unpause a giveaway")
      .addStringOption((option) =>
        option
          .setName("message_id")
          .setDescription("Which giveaway you want to end?")
          .setRequired(true)
          .setMinLength(2)
          .setMaxLength(20),
      ),
  )
  .setRun(async (client, interaction, options) => {
    const guildSettings = client.guild_settings.find(
      (e) => e.guildId === interaction.guildId,
    );
    const lang = client.localization_manager.getLanguage(
      await guildSettings.settings_db.getData("/language"),
    );
    if (client.commandLimiter.take(interaction.member.id)) {
      client.log(
        `${interaction.guild.name}(${interaction.guildId}) | User hit the rate limit: ${interaction.user.username}(${interaction.member.id}).`,
      );
      return interaction.reply({
        embeds: [client.ErrorEmbed(lang.error_title, lang.please_wait_between)],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (
      interaction.memberPermissions.has(
        PermissionsBitField.Flags.Administrator,
      ) ||
      interaction.user.id === process.env.ADMINID
    ) {
      if (interaction.options.getSubcommand() === "create") {
        const channel = interaction.options.getChannel("channel", true);
        const prize = interaction.options.getString("prize", true);
        const duration = interaction.options.getString("duration", true);
        const winners = interaction.options.getInteger("winners", true);
        const hosted_by = interaction.options.getUser("hosted_by", false);
        const thumbnail = options.getAttachment("thumbnail", false);
        let drop = options.getBoolean("drop", false);
        if (!drop) drop = false;
        await client.giveawaysManager
          .start(channel, {
            duration: ms(duration),
            winnerCount: winners,
            prize: prize,
            thumbnail: thumbnail?.url,
            hostedBy: hosted_by,
            isDrop: drop,
            messages: {
              giveaway: lang.giveaway,
              giveawayEnded: lang.giveaway_ended,
              title: lang.giveaway_title,
              drawing: lang.giveaway_drawing,
              dropMessage: lang.giveaway_dropMessage,
              inviteToParticipate: lang.giveaway_inviteToParticipate,
              winMessage: lang.giveaway_winMessage,
              embedFooter: lang.giveaway_embedFooter,
              noWinner: lang.giveaway_noWinner,
              hostedBy: lang.giveaway_hostedBy,
              winners: lang.giveaway_winners,
              endedAt: lang.giveaway_endedAt,
            },
            pauseOptions: {
              content: lang.giveaway_paused,
              embedColor: "#FFFF00",
              infiniteDurationText: lang.giveaway_infinite,
            },
          })
          .then(() => {
            interaction.reply({
              embeds: [client.SuccessEmbed("Success! Giveaway created!")],
              flags: MessageFlags.Ephemeral,
            });
          })
          .catch((err) => {
            interaction.reply({
              embeds: [
                client.SuccessEmbed(
                  `An error has occurred, please check and try again.\n\`${err}\``,
                ),
              ],
              flags: MessageFlags.Ephemeral,
            });
          });
      }
      if (interaction.options.getSubcommand() === "reroll") {
        const messageId = interaction.options.getString("message_id", true);
        client.giveawaysManager
          .reroll(messageId)
          .then(() => {
            interaction.reply({
              embeds: [client.SuccessEmbed("Success! Giveaway rerolled!")],
              flags: MessageFlags.Ephemeral,
            });
          })
          .catch((err) => {
            interaction.reply({
              embeds: [
                client.ErrorEmbed(
                  `An error has occurred, please check and try again.\n\`${err}\``,
                ),
              ],
              flags: MessageFlags.Ephemeral,
            });
          });
      }
      if (interaction.options.getSubcommand() === "edit") {
        const messageId = interaction.options.getString("message_id", true);
        const addTime = interaction.options.getString("add_time", false);
        const newWinnerCount = interaction.options.getInteger(
          "new_winner_count",
          false,
        );
        const newPrize = interaction.options.getString("newPrize", false);
        client.giveawaysManager
          .edit(messageId, {
            addTime: ms(addTime),
            newWinnerCount: newWinnerCount,
            newPrize: newPrize,
          })
          .then(() => {
            interaction.reply({
              embeds: [client.SuccessEmbed("Success! Giveaway updated!")],
              flags: MessageFlags.Ephemeral,
            });
          })
          .catch((err) => {
            interaction.reply({
              embeds: [
                client.ErrorEmbed(
                  `An error has occurred, please check and try again.\n\`${err}\``,
                ),
              ],
              flags: MessageFlags.Ephemeral,
            });
          });
      }
      if (interaction.options.getSubcommand() === "delete") {
        const messageId = interaction.options.getString("message_id", true);
        client.giveawaysManager
          .delete(messageId)
          .then(() => {
            interaction.reply({
              embeds: [client.SuccessEmbed("Success! Giveaway deleted!")],
              flags: MessageFlags.Ephemeral,
            });
          })
          .catch((err) => {
            interaction.reply({
              embeds: [
                client.ErrorEmbed(
                  `An error has occurred, please check and try again.\n\`${err}\``,
                ),
              ],
              flags: MessageFlags.Ephemeral,
            });
          });
      }
      if (interaction.options.getSubcommand() === "end") {
        const messageId = interaction.options.getString("message_id", true);
        client.giveawaysManager
          .end(messageId)
          .then(() => {
            interaction.reply({
              embeds: [client.SuccessEmbed("Success! Giveaway ended!")],
              flags: MessageFlags.Ephemeral,
            });
          })
          .catch((err) => {
            interaction.reply({
              embeds: [
                client.ErrorEmbed(
                  `An error has occurred, please check and try again.\n\`${err}\``,
                ),
              ],
              flags: MessageFlags.Ephemeral,
            });
          });
      }
      if (interaction.options.getSubcommand() === "pause") {
        const messageId = interaction.options.getString("message_id", true);
        let duration = interaction.options.getString("duration", false);
        if (duration) {
          duration = ms(duration);
        } else {
          duration = Infinity;
        }
        client.giveawaysManager
          .pause(messageId, {
            isPaused: true,
            unpauseAfter: duration,
          })
          .then(() => {
            interaction.reply({
              embeds: [client.SuccessEmbed("Success! Giveaway paused!")],
              flags: MessageFlags.Ephemeral,
            });
          })
          .catch((err) => {
            interaction.reply({
              embeds: [
                client.ErrorEmbed(
                  `An error has occurred, please check and try again.\n\`${err}\``,
                ),
              ],
              flags: MessageFlags.Ephemeral,
            });
          });
      }
      if (interaction.options.getSubcommand() === "unpause") {
        const messageId = interaction.options.getString("message_id", true);
        client.giveawaysManager
          .unpause(messageId)
          .then(() => {
            interaction.reply({
              embeds: [client.SuccessEmbed("Success! Giveaway unpaused!")],
              flags: MessageFlags.Ephemeral,
            });
          })
          .catch((err) => {
            interaction.reply({
              embeds: [
                client.ErrorEmbed(
                  `An error has occurred, please check and try again.\n\`${err}\``,
                ),
              ],
              flags: MessageFlags.Ephemeral,
            });
          });
      }
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
