const {
  EmbedBuilder,
  InteractionContextType,
  AttachmentBuilder,
  MessageFlags,
} = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");
const pop = require("../../lib/Popcat-wrapper");
const content_filter = require("deep-profanity-filter");

const command = new SlashCommand()
  .setName("meme")
  .setDescription("Meme creator.")
  .setContexts(InteractionContextType.Guild);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("drake")
    .setDescription("Create the drake meme.")
    .setNameLocalizations({
      hu: "drake",
    })
    .setDescriptionLocalizations({
      hu: "Készít egy drake memet.",
    })
    .addStringOption((option) =>
      option
        .setName("text1")
        .setDescription("Upper text.")
        .setNameLocalizations({
          hu: "szöveg1",
        })
        .setDescriptionLocalizations({
          hu: "Fenti szöveg.",
        })
        .setMinLength(2)
        .setMaxLength(100)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("text2")
        .setDescription("Lower text.")
        .setNameLocalizations({
          hu: "szöveg2",
        })
        .setDescriptionLocalizations({
          hu: "Alsó szöveg.",
        })
        .setMinLength(2)
        .setMaxLength(100)
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("pooh")
    .setDescription("Create the pooh meme.")
    .setNameLocalizations({
      hu: "micimackó",
    })
    .setDescriptionLocalizations({
      hu: "Elkészíti a Micimackó memet.",
    })
    .addStringOption((option) =>
      option
        .setName("text1")
        .setDescription("Upper text.")
        .setNameLocalizations({
          hu: "szöveg1",
        })
        .setDescriptionLocalizations({
          hu: "Fenti szöveg.",
        })
        .setMinLength(2)
        .setMaxLength(100)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("text2")
        .setDescription("Lower text.")
        .setNameLocalizations({
          hu: "szöveg2",
        })
        .setDescriptionLocalizations({
          hu: "Alsó szöveg.",
        })
        .setMinLength(2)
        .setMaxLength(100)
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("happysad")
    .setDescription("Create the happysad meme.")
    .setNameLocalizations({
      hu: "boldog_szomorú",
    })
    .setDescriptionLocalizations({
      hu: "Elkészíti a boldog szomorú memet.",
    })
    .addStringOption((option) =>
      option
        .setName("text1")
        .setDescription("Upper text.")
        .setNameLocalizations({
          hu: "szöveg1",
        })
        .setDescriptionLocalizations({
          hu: "Fenti szöveg.",
        })
        .setMinLength(2)
        .setMaxLength(100)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("text2")
        .setDescription("Lower text.")
        .setNameLocalizations({
          hu: "szöveg2",
        })
        .setDescriptionLocalizations({
          hu: "Alsó szöveg.",
        })
        .setMinLength(2)
        .setMaxLength(100)
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("ship")
    .setDescription("Ship two users.")
    .setNameLocalizations({
      hu: "összehoz",
    })
    .setDescriptionLocalizations({
      hu: "Összehoz két felhasználót.",
    })
    .addUserOption((option) =>
      option
        .setName("user1")
        .setDescription("First user.")
        .setNameLocalizations({
          hu: "felhasználó1",
        })
        .setDescriptionLocalizations({
          hu: "Elsó felhasználó.",
        })
        .setRequired(true),
    )
    .addUserOption((option2) =>
      option2
        .setName("user2")
        .setDescription("Second user.")
        .setNameLocalizations({
          hu: "fehasználó2",
        })
        .setDescriptionLocalizations({
          hu: "Másik felhasználó.",
        })
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("biden")
    .setDescription("Create the biden meme.")
    .setNameLocalizations({
      hu: "biden",
    })
    .setDescriptionLocalizations({
      hu: "Elkészíti a biden memet.",
    })
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("The text for the meme.")
        .setNameLocalizations({
          hu: "szöveg",
        })
        .setDescriptionLocalizations({
          hu: "A szöveg a memehez.",
        })
        .setMinLength(2)
        .setMaxLength(100)
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("pikachu")
    .setDescription("Create the pikachu meme.")
    .setNameLocalizations({
      hu: "pikachu",
    })
    .setDescriptionLocalizations({
      hu: "Elkészíti a pikachu memet.",
    })
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("The text for the meme.")
        .setNameLocalizations({
          hu: "szöveg",
        })
        .setDescriptionLocalizations({
          hu: "A szöveg a memehez.",
        })
        .setMinLength(2)
        .setMaxLength(100)
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("oogway")
    .setDescription("Create the oogway meme.")
    .setNameLocalizations({
      hu: "oogway",
    })
    .setDescriptionLocalizations({
      hu: "Elkészíti a oogway memet.",
    })
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("The text for the meme.")
        .setNameLocalizations({
          hu: "szöveg",
        })
        .setDescriptionLocalizations({
          hu: "A szöveg a memehez.",
        })
        .setMinLength(2)
        .setMaxLength(100)
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("alert")
    .setDescription("Create a alert on your phone.")
    .setNameLocalizations({
      hu: "értesítés",
    })
    .setDescriptionLocalizations({
      hu: "Elkészít egy értesítést a telefonodra.",
    })
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("The text for the alert.")
        .setNameLocalizations({
          hu: "szöveg",
        })
        .setDescriptionLocalizations({
          hu: "A szöveg az étesítéshez.",
        })
        .setMinLength(2)
        .setMaxLength(100)
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("facts")
    .setDescription("Create a fact.")
    .setNameLocalizations({
      hu: "tény",
    })
    .setDescriptionLocalizations({
      hu: "Elkészít egy tényt.",
    })
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("The text for the fact.")
        .setNameLocalizations({
          hu: "szöveg",
        })
        .setDescriptionLocalizations({
          hu: "Mi legyen a tény?",
        })
        .setMinLength(2)
        .setMaxLength(100)
        .setRequired(true),
    ),
);

command.addSubcommand((subcommand) =>
  subcommand
    .setName("unforgivable")
    .setDescription("Create a unforgivable search.")
    .setNameLocalizations({
      hu: "megbocsáthatatlan",
    })
    .setDescriptionLocalizations({
      hu: "Elkövetsz egy megbocsáthatatlan bűnt.",
    })
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("The text for the search.")
        .setNameLocalizations({
          hu: "szöveg",
        })
        .setDescriptionLocalizations({
          hu: "A keresés szövege.",
        })
        .setMinLength(2)
        .setMaxLength(100)
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("sadcat")
    .setDescription("Create the sadcat meme.")
    .setNameLocalizations({
      hu: "szomorú_cica",
    })
    .setDescriptionLocalizations({
      hu: "Elkészíti szomorú cica memet.",
    })
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("The text for the meme.")
        .setNameLocalizations({
          hu: "szöveg",
        })
        .setDescriptionLocalizations({
          hu: "Szöveg a képen.",
        })
        .setMinLength(2)
        .setMaxLength(100)
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("drip")
    .setDescription("Create the drip meme.")
    .setNameLocalizations({
      hu: "drip",
    })
    .setDescriptionLocalizations({
      hu: "Elkészít a drip memet.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("The target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Ki legyen célpont?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("communism")
    .setDescription("Create the communism meme.")
    .setNameLocalizations({
      hu: "kommunizmus",
    })
    .setDescriptionLocalizations({
      hu: "Elkészít a kommunizmus memet.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("The target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Ki legyen a célpont?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("whowouldwin")
    .setDescription("Who would win?")
    .setNameLocalizations({
      hu: "ki_nyerne",
    })
    .setDescriptionLocalizations({
      hu: "Megkérdezi, hogy ki nyerne?",
    })
    .addUserOption((option) =>
      option
        .setName("user1")
        .setDescription("First user.")
        .setNameLocalizations({
          hu: "felhasználó1",
        })
        .setDescriptionLocalizations({
          hu: "Elsó felhasználó.",
        })
        .setRequired(true),
    )
    .addUserOption((option2) =>
      option2
        .setName("user2")
        .setDescription("Second user.")
        .setNameLocalizations({
          hu: "felhasználó2",
        })
        .setDescriptionLocalizations({
          hu: "Második felhasználó.",
        })
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("gun")
    .setDescription("Add a gun to your avatar.")
    .setNameLocalizations({
      hu: "puska",
    })
    .setDescriptionLocalizations({
      hu: "Egy puska kerül a avatárodra.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Célpont felhasználó.",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("clown")
    .setDescription("Create the clown meme.")
    .setNameLocalizations({
      hu: "bohóc",
    })
    .setDescriptionLocalizations({
      hu: "Megcsinálja a bohóc memet.",
    })
    .addUserOption((option2) =>
      option2
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Célpont felhasználó.",
        })
        .setRequired(false),
    ),
);
command.addSubcommand(
  (subcommand) =>
    subcommand
      .setName("jokeoverhead")
      .setDescription("Create the jokeoverhead meme.")
      .setNameLocalizations({
        hu: "jokeoverhead",
      })
      .setDescriptionLocalizations({
        hu: "Megcsinálja a jokeoverhead memet.",
      })
      .addUserOption((option) =>
        option
          .setName("target_user")
          .setDescription("Target user.")
          .setNameLocalizations({
            hu: "felhasználó",
          })
          .setDescriptionLocalizations({
            hu: "Célpont felhasználó.",
          })
          .setRequired(false),
      ),
  command.addSubcommand((subcommand) =>
    subcommand
      .setName("pet")
      .setDescription("Create the pet meme.")
      .setNameLocalizations({
        hu: "simogat",
      })
      .setDescriptionLocalizations({
        hu: "Megcsinálja a simogatós memet.",
      })
      .addUserOption((option) =>
        option
          .setName("target_user")
          .setDescription("Target user.")
          .setNameLocalizations({
            hu: "felhasználó",
          })
          .setDescriptionLocalizations({
            hu: "Célpont felhasználó.",
          })
          .setRequired(false),
      ),
  ),
);

const checkProfanity = async (interaction, options, lang) => {
  const textsToCheck = [
    "text", "text1", "text2",
  ];
  for (const text of textsToCheck) {
    const option = options.getString(text, false);
    if (
      option &&
      content_filter.doesContainBadWords(option.toLowerCase(), interaction.client.wordFilter)
    ) {
      await interaction.reply({
        embeds: [
          interaction.client.ErrorEmbed(lang.bad_word_on_image),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return true;
    }
  }
  return false;
};

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
  if (await checkProfanity(interaction, options, lang)) return;

  await interaction.deferReply();
  const subcommand = interaction.options.getSubcommand();
  let img,
    embed = new EmbedBuilder().setTitle(subcommand.charAt(0).toUpperCase() + subcommand.slice(1));
  try {
    const text1 = options.getString("text1", false);
    const text2 = options.getString("text2", false);
    const text = options.getString("text", false);
    const user1 = options
      .getUser("user1", false)
      ?.displayAvatarURL({ forceStatic: true, extension: "png" });
    const user2 = options
      .getUser("user2", false)
      ?.displayAvatarURL({ forceStatic: true, extension: "png" });
    const targetUser =
      options
        .getUser("target_user", false)
        ?.displayAvatarURL({ forceStatic: true, extension: "png" }) ||
      interaction.user.displayAvatarURL({
        forceStatic: true,
        extension: "png",
      });
    await client.PopcatThrottle.add(async () => {
      switch (subcommand) {
        case "drake":
          img = await pop.drake(text1, text2);
          break;
        case "pooh":
          img = await pop.pooh(text1, text2);
          break;
        case "happysad":
          img = await pop.happysad(text1, text2);
          break;
        case "ship":
          img = await pop.ship(user1, user2);
          break;
        case "biden":
          img = await pop.biden(text);
          break;
        case "pikachu":
          img = await pop.pikachu(text);
          break;
        case "oogway":
          img = await pop.oogway(text);
          break;
        case "alert":
          img = await pop.alert(text);
          break;
        case "facts":
          img = await pop.facts(text);
          break;
        case "unforgivable":
          img = await pop.unforgivable(text);
          break;
        case "sadcat":
          img = await pop.sadcat(text);
          break;
        case "drip":
          img = await pop.drip(targetUser);
          break;
        case "communism":
          img = await pop.communism(targetUser);
          break;
        case "whowouldwin":
          img = await pop.whowouldwin(user1, user2);
          break;
        case "gun":
          img = await pop.gun(targetUser);
          break;
        case "clown":
          img = await pop.clown(targetUser);
          break;
        case "jokeoverhead":
          img = await pop.jokeoverhead(targetUser);
          break;
        case "pet":
          img = await pop.pet(targetUser);
          break;
      }
    });
  } catch (error) {
    return interaction.editReply({
      embeds: [
        client.ErrorEmbed(lang.error_title, lang.picture_failed),
      ],
      flags: MessageFlags.Ephemeral,
    });
  }

  const filename = subcommand === "pet" ? `${subcommand}.gif` : `${subcommand}.png`;
  await embed.setImage(`attachment://${filename}`);
  const attach = new AttachmentBuilder(img).setName(filename);
  await interaction.editReply({
    embeds: [
      embed,
    ],
    files: [
      attach,
    ],
  });
});

module.exports = command;
