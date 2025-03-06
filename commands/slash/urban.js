const { EmbedBuilder, InteractionContextType } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");
const ud = require("ud-api");
const { doesContainBadWords } = require("deep-profanity-filter");

const command = new SlashCommand()
  .setName("urban")
  .setDescription("Get a word from the urban dictionary")
  .setContexts(InteractionContextType.Guild)
  .setNameLocalizations({
    hu: "urban",
  })
  .setDescriptionLocalizations({
    hu: "Lekérdez egy szót a urbandictionary-ből.",
  });
command.addSubcommand((subcommand) =>
  subcommand
    .setName("word")
    .setDescription("Ask a question from the bot.")
    .setNameLocalizations({
      hu: "szó",
    })
    .setDescriptionLocalizations({
      hu: "Lekérdez egy szót a urbandictionary-ből.",
    })
    .addStringOption((option) =>
      option
        .setName("word")
        .setDescription("Which word you want to request?")
        .setAutocomplete(false)
        .setMinLength(2)
        .setMaxLength(50)
        .setNameLocalizations({
          hu: "szó",
        })
        .setDescriptionLocalizations({
          hu: "Mely szót szeretnéd lekérdezni?",
        })
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("random")
    .setDescription("Recognises naked body parts.")
    .setNameLocalizations({
      hu: "véletlen",
    })
    .setDescriptionLocalizations({
      hu: "Elküld egy véletlen szót.",
    }),
);
command.setRun(async (client, interaction, options) => {
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
  if (interaction.options.getSubcommand() === "word") {
    const word = options.getString("word", true).trim();
    ud.define(word, (error, results) => {
      if (error) {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, lang.error_while_searching),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      if (doesContainBadWords(word, client.wordFilter)) {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, lang.bad_word_on_image),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      interaction.reply({
        embeds: [
          new EmbedBuilder().setTitle(results[0].word).setDescription(results[0].definition),
        ],
        ephemeral: false,
      });
    });
  }
  if (interaction.options.getSubcommand() === "random") {
    ud.random()
      .then((results) => {
        interaction.reply({
          embeds: [
            new EmbedBuilder().setTitle(results[0].word).setDescription(results[0].definition),
          ],
          ephemeral: false,
        });
      })
      .catch((error) => {});
  }
});

module.exports = command;
