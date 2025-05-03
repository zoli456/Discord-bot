import colors from "@colors/colors";
import {
  EmbedBuilder,
  PermissionsBitField,
  Colors,
  InteractionContextType,
  MessageFlags,
} from "discord.js";
import SlashCommand from "../../lib/SlashCommand.js";
import { GameManager } from "discord-trivia";

const command = new SlashCommand()
  .setName("trivia")
  .setDescription("Trivia game")
  .setNameLocalizations({
    hu: "trivia",
  })
  .setDescriptionLocalizations({
    hu: "Trivia játék.",
  })
  .setContexts(InteractionContextType.Guild)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("start")
      .setDescription("Start the trivia game")
      .setNameLocalizations({
        hu: "start",
      })
      .setDescriptionLocalizations({
        hu: "Elindítja a trivia játékot.",
      })
      .addStringOption((option1) =>
        option1
          .setName("difficulty")
          .setDescription("Please select a difficulty.")
          .setAutocomplete(false)
          .setRequired(true)
          .setNameLocalizations({
            hu: "nehézség",
          })
          .setDescriptionLocalizations({
            hu: "Kérlek válassz egy nehézséget!",
          })
          .addChoices(
            { name: "Randomized", value: "Randomized" },
            { name: "Easy ", value: "easy" },
            { name: "Medium", value: "medium" },
            { name: "Hard", value: "hard" },
          ),
      )

      .addStringOption((option3) =>
        option3
          .setName("topics")
          .setDescription("Please select a category.")
          .setAutocomplete(false)
          .setRequired(true)
          .setNameLocalizations({
            hu: "téma",
          })
          .setDescriptionLocalizations({
            hu: "Kérlek válassz egy témát!",
          })
          .addChoices(
            { name: "Randomized", value: "Randomized" },
            { name: "General Knowledge ", value: "General Knowledge" },
            { name: "Entertainment: Books ", value: "Entertainment: Books" },
            { name: "Entertainment: Film ", value: "Entertainment: Film" },
            { name: "Entertainment: Music ", value: "Entertainment: Music" },
            {
              name: "Entertainment: Musicals & Theatres",
              value: "Entertainment: Musicals & Theatres",
            },
            {
              name: "Entertainment: Television",
              value: "Entertainment: Television",
            },
            {
              name: "Entertainment: Video Games",
              value: "Entertainment: Video Games",
            },
            {
              name: "Entertainment: Board Games",
              value: "Entertainment: Board Games",
            },
            { name: "Science & Nature ", value: "Science & Nature" },
            { name: "Science: Computers ", value: "Science: Computers" },
            { name: "Science Mathematics ", value: "Science Mathematics" },
            { name: "Mythology ", value: "Mythology" },
            { name: "Sports ", value: "Sports" },
            { name: "Geography ", value: "Geography" },
            { name: "History ", value: "History" },
            { name: "Politics ", value: "Politics" },
            { name: "Art ", value: "Art" },
            { name: "Celebrities ", value: "Celebrities" },
            { name: "Animals ", value: "Animals" },
            { name: "Vehicles ", value: "Vehicles" },
            { name: "Entertainment: Comics ", value: "Entertainment: Comics" },
            { name: "Science: Gadgets ", value: "Science: Gadgets" },
            {
              name: "Entertainment: Japanese Anime & Manga",
              value: "Entertainment: Japanese Anime & Manga",
            },
            {
              name: "Entertainment: Cartoon & Animations",
              value: "Entertainment: Cartoon & Animations",
            },
          ),
      )
      .addIntegerOption((option4) =>
        option4
          .setName("length")
          .setDescription("Please input the length.")
          .setAutocomplete(false)
          .setRequired(true)
          .setNameLocalizations({
            hu: "hossz",
          })
          .setDescriptionLocalizations({
            hu: "Kérlek írd be, hogy hány kérdésből álljon a játék!",
          })
          .setMinValue(3)
          .setMaxValue(50),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("stop")
      .setDescription("Stop a trivia game")
      .setNameLocalizations({
        hu: "stop",
      })
      .setDescriptionLocalizations({
        hu: "Megállítja a trivia játékot.",
      }),
  )
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

    if (interaction.options.getSubcommand() === "start") {
      const trivia_settings_pos = client.trivia_games
        .map((e) => e.guild_id)
        .indexOf(interaction.guildId);
      if (trivia_settings_pos !== -1) {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, lang.trivia_already_started),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      const trivia = new GameManager();
      const game = trivia.createGame(interaction.channel);
      /* .decorate({
          embedColor: Colors.Green,
          buttonStyle: ButtonStyle.Primary,
          embedImage:
            "https://cdn.discordapp.com/attachments/642463574576332831/1141861293465292902/trivia2.png",
          embedThumbnail:
            "https://cdn.discordapp.com/attachments/642463574576332831/1141860395318005810/pngwing.com.png",
        })*/
      /*game.config.embeds.queue = (question) => {
        return new EmbedBuilder().setThumbnail(
          "https://cdn.discordapp.com/attachments/642463574576332831/1141861293465292902/trivia2.png",
        );
      };
      game.config.embeds.question = (player) => {
        return new EmbedBuilder().setThumbnail(
          "https://cdn.discordapp.com/attachments/642463574576332831/1141860395318005810/pngwing.com.png",
        );
      };*/
      game.config.fetchQuestionsOptions.amount = options.getInteger("length", true);
      if (options.getString("topics", true) !== "Randomized") {
        game.config.fetchQuestionsOptions.category = options.getString("topics", true);
      }
      if (options.getString("difficulty", true) !== "Randomized") {
        game.config.fetchQuestionsOptions.difficulty = options.getString("difficulty", true);
      }
      /* category: options.getString("topics", true) undefined,
        difficulty: /*options.getString("difficulty", true) undefined,*/
      game.config.minPlayerCount = 2;
      game.config.maxPlayerCount = 10;
      game.config.showAnswers = true;
      game.config.timeBetweenRounds = 5_000;
      game.config.messageDeleter.queue = 120_000;
      game.config.messageDeleter.gameStart = 20_000;
      game.config.queueDuration = 60_000;
      game.config.timePerQuestion = 15_000;

      game.on("end", (finalData) => {
        const trivia_settings_pos = client.trivia_games
          .map((e) => e.guild_id)
          .indexOf(interaction.guildId);
        if (trivia_settings_pos !== -1) {
          client.trivia_games.splice(trivia_settings_pos, 1);
        }
      });
      await game.startQueue(interaction);
      client.trivia_games.push({
        guild_id: interaction.guildId,
        starter_id: interaction.member.id,
        game_object: game,
      });
    }
    if (interaction.options.getSubcommand() === "stop") {
      const trivia_settings_pos = client.trivia_games
        .map((e) => e.guild_id)
        .indexOf(interaction.guildId);
      if (trivia_settings_pos === -1) {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, lang.no_trivia_game),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      if (
        interaction.user.id !== client.trivia_games[trivia_settings_pos].starter_id &&
        !interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)
      ) {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed(lang.error_title, lang.you_cant_stop_trivia),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      client.trivia_games[trivia_settings_pos].game_object.end();
      return interaction.reply({
        embeds: [
          new EmbedBuilder().setColor(Colors.Green).setDescription(lang.trivia_stopped),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  });
export default command;
