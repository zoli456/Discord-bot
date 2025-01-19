const SlashCommand = require("../../lib/SlashCommand");
const {
  TwoZeroFourEight,
  FindEmoji,
  GuessThePokemon,
  Hangman,
  RockPaperScissors,
  Minesweeper,
  FastType,
  Slots,
  Snake,
  Connect4,
  Roll,
  Wordle,
  MatchPairs,
  WouldYouRather,
} = require("../../lib/Falgames");

const {
  EmbedBuilder,
  ComponentType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionContextType,
} = require("discord.js");

const blackjack = require("discord-blackjack");
const TicTacToe = require("discord-tictactoe");

const command = new SlashCommand()
  .setName("game")
  .setDescription("Start a game.")
  .setNameLocalizations({
    hu: "játék",
  })
  .setDescriptionLocalizations({
    hu: "Elindítja egy játékot.",
  })
  .setContexts(InteractionContextType.Guild)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("2048")
      .setDescription("Start the 2048")
      .setDescriptionLocalizations({
        hu: "Elindítja a 2048 játékot.",
      }),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("memory")
      .setDescription("Start the memory game")
      .setNameLocalizations({
        hu: "memória",
      })
      .setDescriptionLocalizations({
        hu: "Elindítja a memória játékot.",
      }),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("blackjack")
      .setDescription("Start the blackjack game")
      .setNameLocalizations({
        hu: "blackjack",
      })
      .setDescriptionLocalizations({
        hu: "Elindítja a blackjack játékot.",
      }),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("pokemon")
      .setDescription("Start the pokemon game")
      .setNameLocalizations({
        hu: "pokémon",
      })
      .setDescriptionLocalizations({
        hu: "Elindítja a pokémon játékot.",
      }),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("hangman")
      .setDescription("Start the hangman game")
      .setNameLocalizations({
        hu: "akasztófa",
      })
      .setDescriptionLocalizations({
        hu: "Elindítja az akasztófa játékot.",
      })
      .addStringOption((option1) =>
        option1
          .setName("topic")
          .setDescription("Please select a topic.")
          .setAutocomplete(false)
          .setRequired(true)
          .setNameLocalizations({
            hu: "téma",
          })
          .setDescriptionLocalizations({
            hu: "Kérlek válassz egy témát!",
          })
          .addChoices(
            { name: "nature ", value: "nature" },
            { name: "sport", value: "sport" },
            { name: "color", value: "color" },
            { name: "camp", value: "camp" },
            { name: "fruit", value: "fruit" },
            { name: "discord", value: "discord" },
            { name: "winter", value: "winter" },
            { name: "pokemon", value: "pokemon" },
          ),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("minesweeper")
      .setDescription("Start the minesweeper game")
      .setNameLocalizations({
        hu: "aknakereső",
      })
      .setDescriptionLocalizations({
        hu: "Elindítja az aknakereső játékot.",
      }),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("rock_paper_scissors")
      .setDescription("Start the rock paper scissors game")
      .setNameLocalizations({
        hu: "kő_papír_olló",
      })
      .setDescriptionLocalizations({
        hu: "Elindítja a kő papír olló játékot.",
      })
      .addUserOption((option) =>
        option
          .setName("enemy")
          .setDescription("Select a enemy")
          .setRequired(true)
          .setNameLocalizations({
            hu: "ellenfél",
          })
          .setDescriptionLocalizations({
            hu: "Ki legyen az ellenfél?.",
          }),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("slot_machine")
      .setDescription("Start the slot machine game")
      .setNameLocalizations({
        hu: "pörgetés",
      })
      .setDescriptionLocalizations({
        hu: "Elindítja a pörgetés játékot.",
      }),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("snake")
      .setDescription("Start the snake game")
      .setNameLocalizations({
        hu: "kígyó",
      })
      .setDescriptionLocalizations({
        hu: "Elindítja a kígyó játékot.",
      }),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("tictactoe")
      .setDescription("Start the tictactoe game")
      .setNameLocalizations({
        hu: "amőba",
      })
      .setDescriptionLocalizations({
        hu: "Elindítja az amőba játékot.",
      })
      .addUserOption((option) =>
        option
          .setName("opponent")
          .setDescription("Select a enemy")
          .setRequired(false)
          .setNameLocalizations({
            hu: "ellenfél",
          })
          .setDescriptionLocalizations({
            hu: "Ki legyen az ellenfél?.",
          }),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("connect4")
      .setDescription("Start the connect4 game")
      .setNameLocalizations({
        hu: "coonect4",
      })
      .setDescriptionLocalizations({
        hu: "Elindítja a coonect4 játékot.",
      })
      .addUserOption((option) =>
        option
          .setName("enemy")
          .setDescription("Select a enemy")
          .setRequired(true)
          .setNameLocalizations({
            hu: "ellenfél",
          })
          .setDescriptionLocalizations({
            hu: "Ki legyen az ellenfél?.",
          }),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("wordle")
      .setDescription("Start the wordle game")
      .setNameLocalizations({
        hu: "wordle",
      })
      .setDescriptionLocalizations({
        hu: "Elindítja a wordle játékot.",
      }),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("match_pairs")
      .setDescription("Start the match pairs game")
      .setNameLocalizations({
        hu: "párosítás",
      })
      .setDescriptionLocalizations({
        hu: "Elindítja a párosítós játékot.",
      }),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("flag")
      .setDescription("How many flags can you guess in a row within a minute?")
      .setNameLocalizations({
        hu: "zászló",
      })
      .setDescriptionLocalizations({
        hu: "Lássuk hány zászlót tudsz kitalálni 60 másodperc alatt?",
      }),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("fasttype")
      .setDescription("Start the fasttype game")
      .setNameLocalizations({
        hu: "gépelés",
      })
      .setDescriptionLocalizations({
        hu: "Elindítja a gépelés játékot.",
      }),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("logo")
      .setDescription("How many logos can you guess in a row within a minute?")
      .setNameLocalizations({
        hu: "logó",
      })
      .setDescriptionLocalizations({
        hu: "Lássuk hány logót tudsz kitalálni 60 másodperc alatt?",
      }),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("would_you_rather")
      .setDescription("Start the Would You Rather game")
      .setNameLocalizations({
        hu: "would_you_rather",
      })
      .setDescriptionLocalizations({
        hu: "Elindítja a Would You Rather játékot.",
      }),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("roll")
      .setDescription("Lets roll the dice")
      .setNameLocalizations({
        hu: "dobás",
      })
      .setDescriptionLocalizations({
        hu: "Dobsz egyet a kockával.",
      }),
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
      !(await client.is_it_game_channel(interaction.channel, guildSettings))
    ) {
      const temp = await guildSettings.settings_db.getData("/game_channel");
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(
            lang.cant_use_in_this_channel.replace(
              "%channel%",
              temp.game_channel_id,
            ),
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (
      await client.is_it_word_game_channel(interaction.channel, guildSettings)
    ) {
      return interaction.reply({
        embeds: [client.ErrorEmbed(lang.error_title, lang.cant_use_it_here)],
        flags: MessageFlags.Ephemeral,
      });
    }

    const timeoutTime = 60000;
    if (interaction.options.getSubcommand() === "2048") {
      const Game = new TwoZeroFourEight({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: "2048",
          color: "#551476",
        },
        emojis: {
          up: "⬆️",
          down: "⬇️",
          left: "⬅️",
          right: "➡️",
        },
        timeoutTime: 120000,
        stopButton: "Stop",
        buttonStyle: "PRIMARY",
        playerOnlyMessage: "Only {player} can use these buttons.",
      });

      await Game.startGame();
      Game.on("gameOver", (result) => {});
    }
    if (interaction.options.getSubcommand() === "memory") {
      const Game = new FindEmoji({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: "Find Emoji",
          color: "#5865F2",
          description: "Remember the emojis from the board below.",
          findDescription: "Find the {emoji} emoji before the time runs out.",
        },
        timeoutTime: timeoutTime,
        hideEmojiTime: 5000,
        buttonStyle: "PRIMARY",
        emojis: ["🍉", "🍇", "🍊", "🍋", "🥭", "🍎", "🍏", "🥝"],
        winMessage: "You won! You selected the correct emoji. {emoji}",
        loseMessage: "You lost! You selected the wrong emoji. {emoji}",
        timeoutMessage: "You lost! You ran out of time. The emoji is {emoji}",
        playerOnlyMessage: "Only {player} can use these buttons.",
      });

      await Game.startGame();
      Game.on("gameOver", (result) => {});
    }
    if (interaction.options.getSubcommand() === "pokemon") {
      const Game = new GuessThePokemon({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: "Who's The Pokemon",
          color: "#5865F2",
        },
        timeoutTime: timeoutTime,
        winMessage: "You guessed it right! It was a {pokemon}.",
        loseMessage: "Better luck next time! It was a {pokemon}.",
        errMessage: "Unable to fetch pokemon data! Please try again.",
        playerOnlyMessage: "Only {player} can use these buttons.",
      });

      await Game.startGame();
      Game.on("gameOver", (result) => {});
    }
    if (interaction.options.getSubcommand() === "hangman") {
      let topic = options.getString("topic", true);
      const Game = new Hangman({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: "Hangman",
          color: "#5865F2",
        },
        hangman: {
          hat: "🎩",
          head: "😟",
          shirt: "👕",
          pants: "🩳",
          boots: "👞👞",
        },
        //customWord: 'Gamecord',
        timeoutTime: timeoutTime,
        theme: topic,
        winMessage: "You won! The word was **{word}**.",
        loseMessage: "You lost! The word was **{word}**.",
        playerOnlyMessage: "Only {player} can use these buttons.",
      });

      await Game.startGame();
      Game.on("gameOver", (result) => {});
    }
    if (interaction.options.getSubcommand() === "minesweeper") {
      const Game = new Minesweeper({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: "Minesweeper",
          color: "#5865F2",
          description:
            "Click on the buttons to reveal the blocks except mines.",
        },
        emojis: { flag: "🚩", mine: "💣" },
        mines: 5,
        timeoutTime: timeoutTime,
        winMessage: "You won the Game! You successfully avoided all the mines.",
        loseMessage: "You lost the Game! Beaware of the mines next time.",
        playerOnlyMessage: "Only {player} can use these buttons.",
      });

      await Game.startGame();
      Game.on("gameOver", (result) => {});
    }
    if (interaction.options.getSubcommand() === "rock_paper_scissors") {
      const Game = new RockPaperScissors({
        message: interaction,
        isSlashGame: true,
        opponent: options.getUser("enemy", true),
        embed: {
          title: "Rock Paper Scissors",
          color: "#5865F2",
          description: "Press a button below to make a choice.",
        },
        buttons: {
          rock: "Rock",
          paper: "Paper",
          scissors: "Scissors",
        },
        emojis: {
          rock: "🌑",
          paper: "📰",
          scissors: "✂️",
        },
        mentionUser: true,
        timeoutTime: timeoutTime,
        buttonStyle: "PRIMARY",
        pickMessage: "You choose {emoji}.",
        winMessage: "**{player}** won the Game! Congratulations!",
        tieMessage: "The Game tied! No one won the Game!",
        timeoutMessage: "The Game went unfinished! No one won the Game!",
        playerOnlyMessage:
          "Only {player} and {opponent} can use these buttons.",
      });

      await Game.startGame();
      Game.on("gameOver", (result) => {});
    }
    if (interaction.options.getSubcommand() === "slot_machine") {
      const Game = new Slots({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: "Slot Machine",
          color: "#5865F2",
        },
        slots: ["🍇", "🍊", "🍋", "🍌"],
      });

      await Game.startGame();
      Game.on("gameOver", (result) => {});
    }
    if (interaction.options.getSubcommand() === "tictactoe") {
      const game = new TicTacToe({
        language: "en",
        gameBoardDisableButtons: true,
        aiDifficulty: "Hard",
      });
      game.handleInteraction(interaction);
    }
    if (interaction.options.getSubcommand() === "snake") {
      const Game = new Snake({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: "Snake Game",
          overTitle: "Game Over",
          scoreText: "**Score:**",
          color: "#551476",
        },
        emojis: {
          board: "⬛",
          up: "⬆️",
          down: "⬇️",
          left: "⬅️",
          right: "➡️",
        },
        snake: { head: "🟢", body: "🟩", tail: "🟢", over: "💀" },
        foods: ["🍎", "🍇", "🍊", "🫐", "🥕", "🥝", "🌽"],
        stopButton: "Stop",
        timeoutTime: timeoutTime,
        playerOnlyMessage: "Only {player} can use these buttons.",
      });

      await Game.startGame();
      Game.on("gameOver", (result) => {});
    }
    if (interaction.options.getSubcommand() === "connect4") {
      const Game = new Connect4({
        message: interaction,
        isSlashGame: true,
        opponent: options.getUser("enemy", true),
        embed: {
          title: "Connect4 Game",
          statusTitle: "Status",
          color: "#5865F2",
        },
        emojis: {
          board: "⚪",
          player1: "🔴",
          player2: "🟡",
        },
        mentionUser: true,
        timeoutTime: timeoutTime,
        buttonStyle: "PRIMARY",
        turnMessage: "{emoji} | Its turn of player **{player}**.",
        winMessage: "{emoji} | **{player}** won the Connect4 Game.",
        tieMessage: "The Game tied! No one won the Game!",
        timeoutMessage: "The Game went unfinished! No one won the Game!",
        playerOnlyMessage:
          "Only {player} and {opponent} can use these buttons.",
      });

      await Game.startGame();
      Game.on("gameOver", (result) => {});
    }
    if (interaction.options.getSubcommand() === "wordle") {
      const Game = new Wordle({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: "Wordle",
          color: "#5865F2",
        },
        customWord: null,
        timeoutTime: timeoutTime,
        winMessage: "You won! The word was **{word}**.",
        loseMessage: "You lost! The word was **{word}**.",
        playerOnlyMessage: "Only {player} can use these buttons.",
      });

      await Game.startGame();
      Game.on("gameOver", (result) => {});
    }
    if (interaction.options.getSubcommand() === "match_pairs") {
      const Game = new MatchPairs({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: "Match Pairs",
          color: "#5865F2",
          description:
            "**Click on the buttons to match emojis with their pairs.**",
        },
        timeoutTime: timeoutTime,
        emojis: [
          "🍉",
          "🍇",
          "🍊",
          "🥭",
          "🍎",
          "🍏",
          "🥝",
          "🥥",
          "🍓",
          "🫐",
          "🍍",
          "🥕",
          "🥔",
        ],
        winMessage:
          "**You won the Game! You turned a total of `{tilesTurned}` tiles.**",
        loseMessage:
          "**You lost the Game! You turned a total of `{tilesTurned}` tiles.**",
        playerOnlyMessage: "Only {player} can use these buttons.",
      });
      await Game.startGame();

      Game.on("gameOver", (result) => {});
    }
    if (interaction.options.getSubcommand() === "blackjack") {
      await blackjack(interaction);
    }
    if (interaction.options.getSubcommand() === "flag") {
      let language = await guildSettings.settings_db.getData("/language");
      const getRandomCountryIndex = () =>
        Math.floor(Math.random() * client.country_data.length);
      const getButtonText = (index, language) =>
        language === "hu"
          ? client.country_data[index].translations.hun.common
          : client.country_data[index].name.common;

      const generateButtonTexts = (correctIndex, language) => {
        const button_text = [];
        const usedIndexes = new Set([correctIndex]);
        while (button_text.length < 5) {
          const tempIndex = getRandomCountryIndex();
          if (!usedIndexes.has(tempIndex)) {
            button_text.push(getButtonText(tempIndex, language));
            usedIndexes.add(tempIndex);
          }
        }
        const right_answer = Math.floor(Math.random() * 5);
        button_text[right_answer] = getButtonText(correctIndex, language);
        return { button_text, right_answer };
      };

      const createButtons = (button_text) =>
        new ActionRowBuilder().addComponents(
          button_text.map((text, index) =>
            new ButtonBuilder()
              .setCustomId(`button${index}`)
              .setLabel(text)
              .setStyle(ButtonStyle.Primary),
          ),
        );

      const sendFlagMessage = async (flagIndex, button_text) => {
        const buttons = createButtons(button_text);
        return await interaction.reply({
          content: null,
          embeds: [
            new EmbedBuilder()
              .setTitle(lang.flags)
              .setDescription(lang.what_flag1)
              .setImage(client.country_data[flagIndex].flags.png)
              .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL(),
              })
              .setTimestamp(),
          ],
          components: [buttons],
        });
      };

      let correctIndex = getRandomCountryIndex();
      let { button_text, right_answer } = generateButtonTexts(
        correctIndex,
        language,
      );
      let flag_message = await sendFlagMessage(correctIndex, button_text);
      let counter = 0;
      let t = true;

      const filter = (button) => button.user.id === interaction.user.id;
      const collector = flag_message.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 60000,
      });

      collector.on("collect", async (iter) => {
        if (iter.customId === `button${right_answer}`) {
          correctIndex = getRandomCountryIndex();
          ({ button_text, right_answer } = generateButtonTexts(
            correctIndex,
            language,
          ));
          flag_message = await iter.update({
            embeds: [
              new EmbedBuilder()
                .setAuthor({
                  name: interaction.user.tag,
                  iconURL: interaction.user.avatarURL(),
                })
                .setTitle(lang.flags)
                .setDescription(lang.what_flag2)
                .setImage(client.country_data[correctIndex].flags.png)
                .setFooter({
                  text: interaction.guild.name,
                  iconURL: interaction.guild.iconURL(),
                })
                .setTimestamp(),
            ],
            components: [createButtons(button_text)],
          });
          counter++;
        } else {
          t = false;
          collector.stop();
          await flag_message.edit({
            content: null,
            embeds: [
              new EmbedBuilder()
                .setAuthor({
                  name: interaction.user.tag,
                  iconURL: interaction.user.avatarURL(),
                })
                .setTitle(lang.flags)
                .setDescription(
                  `${lang.flags_wrong} **${button_text[right_answer]}**`,
                )
                .setThumbnail(client.country_data[correctIndex].flags.png)
                .addFields({
                  name: lang.guessed_flags,
                  value: `**${counter}**`,
                  inline: true,
                })
                .setFooter({
                  text: interaction.guild.name,
                  iconURL: interaction.guild.iconURL(),
                })
                .setTimestamp(),
            ],
            components: [],
          });
        }
      });

      collector.on("end", async () => {
        if (t)
          await flag_message.edit({
            content: null,
            embeds: [
              new EmbedBuilder()
                .setAuthor({
                  name: interaction.user.tag,
                  iconURL: interaction.user.avatarURL(),
                })
                .setTitle(lang.flags)
                .setDescription(
                  `${lang.flags_time_is_up} **${button_text[right_answer]}**`,
                )
                .setThumbnail(client.country_data[correctIndex].flags.png)
                .addFields({
                  name: lang.guessed_flags,
                  value: `**${counter}**`,
                  inline: true,
                })
                .setTimestamp(),
            ],
            components: [],
          });
      });
    }
    if (interaction.options.getSubcommand() === "fasttype") {
      await interaction.deferReply();

      let sentence;
      await fetch("https://api.quotable.io/random")
        .then((response) => response.json())
        .then((data) => {
          sentence = data.content;
        });

      const Game = new FastType({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: "Fast Type",
          color: "#5865F2",
          description: "You have {time} seconds to type the sentence below.",
        },
        timeoutTime: timeoutTime,
        sentence: sentence,
        winMessage:
          "You won! You finished the type race in {time} seconds with wpm of {wpm}.",
        loseMessage: "You lost! You didn't type the correct sentence in time.",
      });

      Game.startGame();
      Game.on("gameOver", (result) => {});
    }
    if (interaction.options.getSubcommand() === "logo") {
      const getRandomIndex = (length) => Math.floor(Math.random() * length);
      const getRandomLogo = () =>
        client.logo_data[getRandomIndex(client.logo_data.length)];

      const createButton = (id, label) =>
        new ButtonBuilder()
          .setCustomId(id)
          .setLabel(label)
          .setStyle(ButtonStyle.Primary);

      const createButtons = (buttonText) =>
        new ActionRowBuilder().addComponents(
          buttonText.map((text, index) =>
            createButton(`button${index}`, text.name),
          ),
        );

      const selectWrongAnswers = (correctLogo, numberOfAnswers) => {
        const answers = [];
        while (answers.length < numberOfAnswers) {
          const tempLogo = getRandomLogo();
          if (
            !answers.includes(tempLogo) &&
            tempLogo.name !== correctLogo.name
          ) {
            answers.push(tempLogo);
          }
        }
        return answers;
      };

      const updateLogoMessage = async (
        interaction,
        logo,
        buttonText,
        description,
      ) => {
        const buttons = createButtons(buttonText);
        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setTitle(lang.logos)
              .setDescription(description)
              .setImage(
                `https://raw.githubusercontent.com/zoli456/logos/master/logos/${logo.files[0]}`,
              )
              .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL(),
              })
              .setTimestamp(),
          ],
          components: [buttons],
        });
      };

      let counter = 0;
      let logo = getRandomLogo();
      let buttonText = selectWrongAnswers(logo, 4);
      const rightAnswerIndex = getRandomIndex(5);
      buttonText.splice(rightAnswerIndex, 0, logo);

      let logoMsg = await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(lang.logos)
            .setDescription(lang.what_logo1)
            .setImage(
              `https://raw.githubusercontent.com/zoli456/logos/master/logos/${logo.files[0]}`,
            )
            .setFooter({
              text: interaction.guild.name,
              iconURL: interaction.guild.iconURL(),
            })
            .setTimestamp(),
        ],
        components: [createButtons(buttonText)],
      });

      const filter = (button) => button.user.id === interaction.user.id;
      const collector = logoMsg.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 60000,
      });

      collector.on("collect", async (iter) => {
        const isCorrect = iter.customId === `button${rightAnswerIndex}`;
        if (isCorrect) {
          logo = getRandomLogo();
          buttonText = selectWrongAnswers(logo, 4);
          buttonText.splice(rightAnswerIndex, 0, logo);
          await updateLogoMessage(iter, logo, buttonText, lang.what_logo2);
          counter++;
        } else {
          collector.stop();
          await logoMsg.edit({
            content: null,
            embeds: [
              new EmbedBuilder()
                .setAuthor({
                  name: interaction.user.tag,
                  iconURL: interaction.user.avatarURL(),
                })
                .setTitle(lang.logos)
                .setDescription(
                  `${lang.logos_wrong} [${logo.name}](${logo.url})`,
                )
                .setThumbnail(
                  `https://raw.githubusercontent.com/zoli456/logos/master/logos/${logo.files[0]}`,
                )
                .setFields({
                  name: lang.guessed_logos,
                  value: `**${counter}**`,
                  inline: true,
                })
                .setFooter({
                  text: interaction.guild.name,
                  iconURL: interaction.guild.iconURL(),
                })
                .setTimestamp(),
            ],
            components: [],
          });
        }
      });

      collector.on("end", async () => {
        if (collector.endReason !== "user") {
          await logoMsg.edit({
            content: null,
            embeds: [
              new EmbedBuilder()
                .setAuthor({
                  name: interaction.user.tag,
                  iconURL: interaction.user.avatarURL(),
                })
                .setTitle(lang.logos)
                .setDescription(
                  `${lang.logos_time_is_up} [${logo.name}](${logo.url})`,
                )
                .setThumbnail(
                  `https://raw.githubusercontent.com/zoli456/logos/master/logos/${logo.files[0]}`,
                )
                .setFields({
                  name: lang.guessed_logos,
                  value: `**${counter}**`,
                  inline: true,
                })
                .setTimestamp(),
            ],
            components: [],
          });
        }
      });
    }
    if (interaction.options.getSubcommand() === "would_you_rather") {
      const Game = new WouldYouRather({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: "Would You Rather",
          color: "#551476",
        },
        buttons: {
          option1: "Option 1",
          option2: "Option 2",
        },
        timeoutTime: 60000,
        errMessage: "Unable to fetch question data! Please try again.",
        playerOnlyMessage: "Only {player} can use these buttons.",
      });
      await Game.startGame();
      Game.on("gameOver", (result) => {});
    }
    if (interaction.options.getSubcommand() === "roll") {
      const Game = new Roll({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: "Dice Roll",
          color: "#551476",
        },
        notValidRollMessage: "Please provide a valid roll.",
        rollLimit: 500,
        rollLimitMessage: "You can't roll this much dice.",
      });
      await Game.roll("1d6");
    }
  });
module.exports = command;
