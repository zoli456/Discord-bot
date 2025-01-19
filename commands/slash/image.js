const SlashCommand = require("../../lib/SlashCommand");
const {
  EmbedBuilder,
  InteractionContextType,
  AttachmentBuilder,
  MessageFlags,
} = require("discord.js");
const DIG = require("../../lib/Image-Generation");
const content_filter = require("deep-profanity-filter");

const command = new SlashCommand()
  .setName("image")
  .setDescription("Image creator")
  .setNameLocalizations({
    hu: "kép",
  })
  .setDescriptionLocalizations({
    hu: "Képkészítő.",
  })
  .setContexts(InteractionContextType.Guild);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("blur")
    .setDescription("Makes your avatar blurry.")
    .setNameLocalizations({
      hu: "homály",
    })
    .setDescriptionLocalizations({
      hu: "Elhomályosítja az avatárod.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("gay")
    .setDescription("Makes your avatar gay.")
    .setNameLocalizations({
      hu: "meleg",
    })
    .setDescriptionLocalizations({
      hu: "Rárajzolja az avatárodra a melegmozgalom zászlaját.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("greyscale")
    .setDescription("Makes your avatar greyscale.")
    .setNameLocalizations({
      hu: "szürkeárnyalatos",
    })
    .setDescriptionLocalizations({
      hu: "Az avatárodat szürkeárnyalatosra változtatja.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("invert")
    .setDescription("Makes your avatar inverted.")
    .setNameLocalizations({
      hu: "fordított",
    })
    .setDescriptionLocalizations({
      hu: "Az avatárod színeit megfordítja.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("changemymind")
    .setDescription("Create the changemymind meme.")
    .setNameLocalizations({
      hu: "changemymind",
    })
    .setDescriptionLocalizations({
      hu: "Itt az idő, hogy valaki meggyőzzön az elllenkezőjéről.",
    })
    .addStringOption((option) =>
      option
        .setName("text")
        .setMinLength(2)
        .setMaxLength(50)
        .setDescription("Text for the meme.")
        .setNameLocalizations({
          hu: "szöveg",
        })
        .setDescriptionLocalizations({
          hu: "Mi legyen a szöveg a táblán?",
        })
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("triggered")
    .setDescription("Makes your avatar triggered.")
    .setNameLocalizations({
      hu: "triggered",
    })
    .setDescriptionLocalizations({
      hu: "Az avatárod nagyon mérges lesz.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("ad")
    .setDescription("Makes your avatar an ad.")
    .setNameLocalizations({
      hu: "hirdetés",
    })
    .setDescriptionLocalizations({
      hu: "Az avatárod egy hirdetéssé változtatja.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("batslap")
    .setDescription("Batman slap your face.")
    .setNameLocalizations({
      hu: "batman_pofon",
    })
    .setDescriptionLocalizations({
      hu: "Batman bofán ver.",
    })
    .addUserOption((option) =>
      option
        .setName("batman")
        .setDescription("Avatar over batman's face.")
        .setNameLocalizations({
          hu: "batnam",
        })
        .setDescriptionLocalizations({
          hu: "Ki legyen Batman?",
        })
        .setRequired(true),
    )
    .addUserOption((option) =>
      option
        .setName("enemy")
        .setDescription("Avatar over villian's face.")
        .setNameLocalizations({
          hu: "ellenség",
        })
        .setDescriptionLocalizations({
          hu: "Ki legyen a rosszfiú?",
        })
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("beautiful")
    .setDescription("Makes your avatar beautiful.")
    .setNameLocalizations({
      hu: "szép",
    })
    .setDescriptionLocalizations({
      hu: "Az avatárod egy szép képpé alakítja.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("bed")
    .setDescription("Who is under your bed?.")
    .setNameLocalizations({
      hu: "ágy",
    })
    .setDescriptionLocalizations({
      hu: "Ki van az ágyad alatt?",
    })
    .addUserOption((option) =>
      option
        .setName("upper")
        .setDescription("Upper bed avatar.")
        .setNameLocalizations({
          hu: "felső",
        })
        .setDescriptionLocalizations({
          hu: "Ki legyen a felső ágyan?",
        })
        .setRequired(true),
    )
    .addUserOption((option2) =>
      option2
        .setName("lower")
        .setDescription("Lower bed avatar.")
        .setNameLocalizations({
          hu: "alsó",
        })
        .setDescriptionLocalizations({
          hu: "Ki legyen a alsó ágyan?",
        })
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("bobross")
    .setDescription("Bobross will paint your avatar.")
    .setNameLocalizations({
      hu: "bobross",
    })
    .setDescriptionLocalizations({
      hu: "Az avatárodat lefogja festeni.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);

command.addSubcommand((subcommand) =>
  subcommand
    .setName("deepfry")
    .setDescription("Deepfry your avatar.")
    .setNameLocalizations({
      hu: "égetés",
    })
    .setDescriptionLocalizations({
      hu: "Kiégeti az avartárod színeit.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("delete")
    .setDescription("You must delete this.")
    .setNameLocalizations({
      hu: "törlés",
    })
    .setDescriptionLocalizations({
      hu: "Ezt muszáj törölnöd.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("facepalm")
    .setDescription("This must a facepalm.")
    .setNameLocalizations({
      hu: "facepalm",
    })
    .setDescriptionLocalizations({
      hu: "Ezt a marhaságot.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("hitler")
    .setDescription("You are so bad.")
    .setNameLocalizations({
      hu: "hitler",
    })
    .setDescriptionLocalizations({
      hu: "Rosszabb, mint Hitler.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("jail")
    .setDescription("You are in jail.")
    .setNameLocalizations({
      hu: "börtön",
    })
    .setDescriptionLocalizations({
      hu: "Rácsok mögé kerültél.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("kiss")
    .setDescription("You kiss somebody.")
    .setNameLocalizations({
      hu: "csók",
    })
    .setDescriptionLocalizations({
      hu: "Valakit megcsókolsz.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user1")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó1",
        })
        .setDescriptionLocalizations({
          hu: "Ki csókoljon?",
        })
        .setRequired(false),
    )
    .addUserOption((option) =>
      option
        .setName("target_user2")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó2",
        })
        .setDescriptionLocalizations({
          hu: "Ki fogadja?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("lisa_presentation")
    .setDescription("Lisa want to tell you something.")
    .setNameLocalizations({
      hu: "lisa_prezentáció",
    })
    .setDescriptionLocalizations({
      hu: "Lisa szeretne mondani valamit.",
    })
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("This will on the board")
        .setAutocomplete(false)
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(200)
        .setNameLocalizations({
          hu: "szöveg",
        })
        .setDescriptionLocalizations({
          hu: "Mi legyen Lisa táblájá?n",
        }),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("podium")
    .setDescription("You are on the podium.")
    .setNameLocalizations({
      hu: "pódium",
    })
    .setDescriptionLocalizations({
      hu: "Lássuk első három helyezetett.",
    })
    .addUserOption((option) =>
      option
        .setName("first_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "első",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd használni?",
        })
        .setRequired(true),
    )
    .addUserOption((option2) =>
      option2
        .setName("second_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "második",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd használni?",
        })
        .setRequired(true),
    )
    .addUserOption((option3) =>
      option3
        .setName("third_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "harmadik",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd használni?",
        })
        .setRequired(true),
    )
    .addStringOption((option4) =>
      option4
        .setName("text1")
        .setDescription("Text for the first.")
        .setAutocomplete(false)
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(15)
        .setNameLocalizations({
          hu: "első_szöveg",
        })
        .setDescriptionLocalizations({
          hu: "Mi legyen az első tábláján?",
        }),
    )
    .addStringOption((option5) =>
      option5
        .setName("text2")
        .setDescription("Text for the second.")
        .setAutocomplete(false)
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(15)
        .setNameLocalizations({
          hu: "második_szöveg",
        })
        .setDescriptionLocalizations({
          hu: "Mi legyen az második tábláján?",
        }),
    )
    .addStringOption((option6) =>
      option6
        .setName("text3")
        .setDescription("Text for the third.")
        .setAutocomplete(false)
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(15)
        .setNameLocalizations({
          hu: "harmdik_szöveg",
        })
        .setDescriptionLocalizations({
          hu: "Mi legyen az harmadik tábláján?",
        }),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("poutine")
    .setDescription("Poutine like you.")
    .setNameLocalizations({
      hu: "putyin",
    })
    .setDescriptionLocalizations({
      hu: "Putyin szeretné tudni a koordinátákat.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("rip")
    .setDescription("Rest in peace.")
    .setNameLocalizations({
      hu: "halott",
    })
    .setDescriptionLocalizations({
      hu: "Nyugodjék békében!",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("spank")
    .setDescription("Who need a good spanking?")
    .setNameLocalizations({
      hu: "fenekelés",
    })
    .setDescriptionLocalizations({
      hu: "Kinek kell egy fenekelés?",
    })
    .addUserOption((option) =>
      option
        .setName("target_user1")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó1",
        })
        .setDescriptionLocalizations({
          hu: "Aki üt.",
        })
        .setRequired(false),
    )
    .addUserOption((option1) =>
      option1
        .setName("target_user2")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó2",
        })
        .setDescriptionLocalizations({
          hu: "Akit ütnek.",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("thomas")
    .setDescription("Time to replace Thomas.")
    .setNameLocalizations({
      hu: "thomas",
    })
    .setDescriptionLocalizations({
      hu: "Itt az ideje, hogy lecseréld Thomast.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("trash")
    .setDescription("Look it better. Its trash.")
    .setNameLocalizations({
      hu: "szemét",
    })
    .setDescriptionLocalizations({
      hu: "Nézd meg jobban! Ez rakás szemét.",
    })
    .addUserOption((option) =>
      option
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Kinek az avartárját szeretnéd átrajzolni?",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("wanted")
    .setDescription("Wanted dead or alive.")
    .setNameLocalizations({
      hu: "körözött",
    })
    .setDescriptionLocalizations({
      hu: "Körözött élve vagy halva.",
    })
    .addStringOption((option2) =>
      option2
        .setName("currency")
        .setDescription("Currency on the poster")
        .setAutocomplete(false)
        .setRequired(true)
        .addChoices({ name: "$", value: "$" }, { name: "€", value: "€" })
        .setNameLocalizations({
          hu: "pénznem",
        })
        .setDescriptionLocalizations({
          hu: "Mi legyen a pénznem a poszteren?",
        }),
    )
    .addUserOption((option1) =>
      option1
        .setName("target_user")
        .setDescription("Target user.")
        .setNameLocalizations({
          hu: "felhasználó",
        })
        .setDescriptionLocalizations({
          hu: "Ki a körözött személy?",
        })
        .setRequired(false),
    ),
);
command.setRun(async (client, interaction, options) => {
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
    await client.is_it_word_game_channel(interaction.channel, guildSettings)
  ) {
    return interaction.reply({
      embeds: [client.ErrorEmbed(lang.error_title, lang.cant_use_it_here)],
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.deferReply();

  // Make the image
  let img;
  let embed = new EmbedBuilder();
  let filename;
  embed.setTitle(
    interaction.options.getSubcommand().toString().charAt(0).toUpperCase() +
      interaction.options.getSubcommand().toString().slice(1),
  );
  try {
    if (interaction.options.getSubcommand() === "blur") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Blur().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              }),
        );
      });
      filename = "blur.jpg";
    }
    if (interaction.options.getSubcommand() === "gay") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Gay().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "png",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "png",
              }),
        );
      });
      filename = "gay.jpeg";
    }
    if (interaction.options.getSubcommand() === "greyscale") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Greyscale().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              }),
        );
      });
      filename = "greyscale.jpg";
    }
    if (interaction.options.getSubcommand() === "invert") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Invert().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              }),
        );
      });
      filename = "invert.jpg";
    }
    if (interaction.options.getSubcommand() === "changemymind") {
      if (
        content_filter.doesContainBadWords(
          options.getString("text", true).toLowerCase(),
          client.wordFilter,
        )
      ) {
        return interaction
          .editReply({
            embeds: [
              client.ErrorEmbed(lang.error_title, lang.bad_word_on_image),
            ],
            flags: MessageFlags.Ephemeral,
          })
          .then((msg) => setTimeout(() => msg.delete(), 20000));
      }
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Changemymind().getImage(
          options.getString("text", true),
        );
      });
      filename = "changemymind.jpeg";
    }
    if (interaction.options.getSubcommand() === "triggered") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Triggered().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              }),
        );
      });
      filename = "triggered.gif";
    }
    if (interaction.options.getSubcommand() === "ad") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Ad().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              }),
        );
      });
      filename = "ad.jpg";
    }
    if (interaction.options.getSubcommand() === "batslap") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Batslap().getImage(
          options.getUser("batman", true).displayAvatarURL({
            forceStatic: true,
            extension: "jpg",
          }),
          options.getUser("enemy", true).displayAvatarURL({
            forceStatic: true,
            extension: "jpg",
          }),
        );
      });
      filename = "batslap.jpg";
    }
    if (interaction.options.getSubcommand() === "beautiful") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Beautiful().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              }),
        );
      });
      filename = "beautiful.jpg";
    }
    if (interaction.options.getSubcommand() === "bed") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Bed().getImage(
          options.getUser("upper", true).displayAvatarURL({
            forceStatic: true,
            extension: "jpg",
          }),
          options.getUser("lower", true).displayAvatarURL({
            forceStatic: true,
            extension: "jpg",
          }),
        );
      });
      filename = "bed.jpg";
    }
    if (interaction.options.getSubcommand() === "bobross") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Bobross().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              }),
        );
      });
      filename = "bobross.jpg";
    }
    if (interaction.options.getSubcommand() === "deepfry") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Deepfry().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              }),
        );
      });
      filename = "deepfry.jpg";
    }
    if (interaction.options.getSubcommand() === "delete") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Delete().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              }),
        );
      });
      filename = "delete.jpg";
    }
    if (interaction.options.getSubcommand() === "facepalm") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Facepalm().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              }),
        );
      });
      filename = "facepalm.jpg";
    }
    if (interaction.options.getSubcommand() === "hitler") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Hitler().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              }),
        );
      });
      filename = "hitler.jpg";
    }
    if (interaction.options.getSubcommand() === "jail") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Jail().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              }),
        );
      });
      filename = "jail.jpg";
    }
    if (interaction.options.getSubcommand() === "kiss") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Kiss().getImage(
          options.getUser("target_user1", true).displayAvatarURL({
            forceStatic: true,
            extension: "jpg",
          }),
          options.getUser("target_user2", true).displayAvatarURL({
            forceStatic: true,
            extension: "jpg",
          }),
        );
      });
      filename = "kiss.jpg";
    }
    if (interaction.options.getSubcommand() === "lisa_presentation") {
      if (
        content_filter.doesContainBadWords(
          options.getString("text", true).toLowerCase(),
          client.wordFilter,
        )
      ) {
        return interaction
          .editReply({
            embeds: [
              client.ErrorEmbed(lang.error_title, lang.bad_word_on_image),
            ],
            flags: MessageFlags.Ephemeral,
          })
          .then((msg) => setTimeout(() => msg.delete(), 20000));
      }
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.LisaPresentation().getImage(
          options.getString("text", true),
        );
      });
      filename = "lisa_presentation.jpeg";
    }
    if (interaction.options.getSubcommand() === "podium") {
      if (
        content_filter.doesContainBadWords(
          options.getString("text1", true).toLowerCase(),
          client.wordFilter,
        ) ||
        content_filter.doesContainBadWords(
          options.getString("text2", true).toLowerCase(),
          client.wordFilter,
        ) ||
        content_filter.doesContainBadWords(
          options.getString("text3", true).toLowerCase(),
          client.wordFilter,
        )
      ) {
        return interaction
          .editReply({
            embeds: [
              client.ErrorEmbed(lang.error_title, lang.bad_word_on_image),
            ],
            flags: MessageFlags.Ephemeral,
          })
          .then((msg) => setTimeout(() => msg.delete(), 20000));
      }
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Podium().getImage(
          options.getUser("first_user", true).displayAvatarURL({
            forceStatic: true,
            extension: "png",
          }),
          options.getUser("second_user", true).displayAvatarURL({
            forceStatic: true,
            extension: "png",
          }),
          options.getUser("third_user", true).displayAvatarURL({
            forceStatic: true,
            extension: "png",
          }),
          options.getString("text1", true),
          options.getString("text2", true),
          options.getString("text3", true),
        );
      });
      filename = "podium.jpeg";
    }
    if (interaction.options.getSubcommand() === "poutine") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Poutine().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              }),
        );
      });
      filename = "poutine.jpg";
    }
    if (interaction.options.getSubcommand() === "rip") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Rip().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "png",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "png",
              }),
        );
      });
      filename = "rip.jpeg";
    }
    if (interaction.options.getSubcommand() === "spank") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Spank().getImage(
          options.getUser("target_user1", true).displayAvatarURL({
            forceStatic: true,
            extension: "jpg",
          }),
          options.getUser("target_user2", true).displayAvatarURL({
            forceStatic: true,
            extension: "jpg",
          }),
        );
      });
      filename = "spank.jpg";
    }
    if (interaction.options.getSubcommand() === "thomas") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Thomas().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              }),
        );
      });
      filename = "thomas.jpg";
    }
    if (interaction.options.getSubcommand() === "trash") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Trash().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "jpg",
              }),
        );
      });
      filename = "trash.jpg";
    }
    if (interaction.options.getSubcommand() === "wanted") {
      await client.imageGeneratorThrottle.add(async () => {
        img = await new DIG.Wanted().getImage(
          options.getUser("target_user", false)
            ? options.getUser("target_user", false).displayAvatarURL({
                forceStatic: true,
                extension: "png",
              })
            : interaction.user.displayAvatarURL({
                forceStatic: true,
                extension: "png",
              }),
          options.getString("currency", true),
        );
      });
      filename = "wanted.jpeg";
    }
  } catch (error) {
    return interaction.editReply({
      embeds: [client.ErrorEmbed(lang.error_title, lang.picture_failed)],
      flags: MessageFlags.Ephemeral,
    });
  }
  embed.setImage(`attachment://${filename}`);
  let attach = new AttachmentBuilder(img).setName(filename);
  await interaction.editReply({
    embeds: [embed],
    files: [attach],
  });
});

module.exports = command;
