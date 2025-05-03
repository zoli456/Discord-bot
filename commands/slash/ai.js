import { EmbedBuilder, MessageFlags, InteractionContextType } from "discord.js";
import SlashCommand from "../../lib/SlashCommand.js";
import { question } from "../..//lib/hercai/index.js";
import check_image from "../../lib/Image-Generation/module/functions.js";

const command = new SlashCommand()
  .setName("ai")
  .setDescription("Ask the ai")
  .setContexts(InteractionContextType.Guild)
  .setNameLocalizations({
    hu: "mi",
  })
  .setDescriptionLocalizations({
    hu: "Kérdezz valamit a géptől.",
  });
command.addSubcommand((subcommand) =>
  subcommand
    .setName("question")
    .setDescription("Ask a question from the bot.")
    .setNameLocalizations({
      hu: "kérdés",
    })
    .setDescriptionLocalizations({
      hu: "Kérdezz valamit a géptől.",
    })
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The question for the bot.")
        .setAutocomplete(false)
        .setMinLength(2)
        .setMaxLength(512)
        .setNameLocalizations({
          hu: "kérdés",
        })
        .setDescriptionLocalizations({
          hu: "Mit szeretnél kérdezni a géptől?",
        })
        .setRequired(true),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("nsfw")
    .setDescription("Recognises naked body parts.")
    .setNameLocalizations({
      hu: "nsfw",
    })
    .setDescriptionLocalizations({
      hu: "Felismer testrészeket.",
    })
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Url of the image.")
        .setAutocomplete(false)
        .setMinLength(2)
        .setMaxLength(1024)
        .setNameLocalizations({
          hu: "url",
        })
        .setDescriptionLocalizations({
          hu: "A kép elérési útja.",
        })
        .setRequired(false),
    )
    .addAttachmentOption((option2) =>
      option2
        .setName("attachment")
        .setDescription("Attachment the image.")
        .setNameLocalizations({
          hu: "csatolmány",
        })
        .setDescriptionLocalizations({
          hu: "A kép csatorlása.",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("age")
    .setDescription("Detect age of people on a picture.")
    .setNameLocalizations({
      hu: "kor",
    })
    .setDescriptionLocalizations({
      hu: "Megpróbálj megtippelni a képen szereplő személyek korát.",
    })
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Url of the image.")
        .setAutocomplete(false)
        .setMinLength(2)
        .setMaxLength(1024)
        .setNameLocalizations({
          hu: "url",
        })
        .setDescriptionLocalizations({
          hu: "A kép elérési útja.",
        })
        .setRequired(false),
    )
    .addAttachmentOption((option2) =>
      option2
        .setName("attachment")
        .setDescription("Attachment the image.")
        .setNameLocalizations({
          hu: "csatolmány",
        })
        .setDescriptionLocalizations({
          hu: "A kép csatorlása.",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("emotion")
    .setDescription("Detect people's emotions on a picture.")
    .setNameLocalizations({
      hu: "érzelem",
    })
    .setDescriptionLocalizations({
      hu: "Megpróbálj a képen szereplő személyek érzelmeit megtippelni.",
    })
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Url of the image.")
        .setAutocomplete(false)
        .setMinLength(2)
        .setMaxLength(1024)
        .setNameLocalizations({
          hu: "url",
        })
        .setDescriptionLocalizations({
          hu: "A kép elérési útja.",
        })
        .setRequired(false),
    )
    .addAttachmentOption((option2) =>
      option2
        .setName("attachment")
        .setDescription("Attachment the image.")
        .setNameLocalizations({
          hu: "csatolmány",
        })
        .setDescriptionLocalizations({
          hu: "A kép csatorlása.",
        })
        .setRequired(false),
    ),
);
command.addSubcommand((subcommand) =>
  subcommand
    .setName("logo")
    .setDescription("Detect logoes on a picture.")
    .setNameLocalizations({
      hu: "logo",
    })
    .setDescriptionLocalizations({
      hu: "Megpróbálj a képen szereplő logókat megtippelni.",
    })
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Url of the image.")
        .setAutocomplete(false)
        .setMinLength(2)
        .setMaxLength(1024)
        .setNameLocalizations({
          hu: "url",
        })
        .setDescriptionLocalizations({
          hu: "A kép elérési útja.",
        })
        .setRequired(false),
    )
    .addAttachmentOption((option2) =>
      option2
        .setName("attachment")
        .setDescription("Attachment the image.")
        .setNameLocalizations({
          hu: "csatolmány",
        })
        .setDescriptionLocalizations({
          hu: "A kép csatorlása.",
        })
        .setRequired(false),
    ),
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
  await interaction.deferReply();
  if (interaction.options.getSubcommand() === "question") {
    await client.AiThrottle.add(async () => {
      await question({
        model: "v3-32k",
        content: options.getString("question", true),
      })
        .then((response) => {
          interaction.editReply(response.reply);
        })
        .catch((error) => {
          return interaction.editReply({
            embeds: [
              client.ErrorEmbed(lang.error_title, lang.no_response_question),
            ],
            flags: MessageFlags.Ephemeral,
          });
        });
    });
    return;
  }
  let input_url = options.getString("url", false)?.trim();
  if (interaction.options.getSubcommand() === "nsfw") {
    if (!interaction.channel.nsfw) {
      return interaction.editReply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.not_nsfw_channel),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (input_url) {
      if (!(await check_image.validateURL(input_url))) {
        return interaction.editReply({
          embeds: [
            client.ErrorEmbed(lang.error_title, lang.invalid_link),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      input_url = options.getAttachment("attachment", false);
      if (!input_url) {
        return interaction.editReply({
          embeds: [
            client.ErrorEmbed(lang.error_title, lang.no_input_image),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        input_url = input_url.url;
      }
    }
    try {
      let response;
      await client.AiThrottle.add(async () => {
        response = await fetch(
          "https://nsfw-images-detection-and-classification.p.rapidapi.com/adult-content",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-RapidAPI-Key": process.env.NSFW_IMAGE_DETECTION_API_KEY,
              "X-RapidAPI-Host": "nsfw-images-detection-and-classification.p.rapidapi.com",
            },
            body: JSON.stringify({
              url: input_url,
            }),
          },
        ).then((res) => res.json());
      });

      const response_embed = new EmbedBuilder();
      if (response.unsafe) {
        response_embed.setTitle(lang.unsafe_picture).setColor("#ff0000");
      } else {
        response_embed.setTitle(lang.safe_picture).setColor("#00ff00");
      }
      console.log(response);
      let bot_answer =
        response.objects.length === 0
          ? `${lang.detected_elements} ${lang.none}`
          : `${lang.detected_elements} ${response.objects.map((obj) => lang[obj.label.toLowerCase()]).join(", ")}`;

      response_embed.setDescription(bot_answer).setImage(input_url);
      await interaction.editReply({
        embeds: [
          response_embed,
        ],
      });
    } catch (error) {
      console.log(error);
      return interaction.editReply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.no_response_question),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    return;
  }
  if (
    interaction.options.getSubcommand() === "age" ||
    interaction.options.getSubcommand() === "emotion" ||
    interaction.options.getSubcommand() === "logo"
  ) {
    if (input_url) {
      if (!(await check_image.validateURL(input_url))) {
        return interaction.editReply({
          embeds: [
            client.ErrorEmbed(lang.error_title, lang.invalid_link),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      input_url = options.getAttachment("attachment", false);
      if (!input_url) {
        return interaction.editReply({
          embeds: [
            client.ErrorEmbed(lang.error_title, lang.no_input_image),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        input_url = input_url.url;
      }
    }
    let NSFW_api_key;
    client.NSFW_api_changer++;
    if (client.NSFW_api_changer === 3) {
      client.NSFW_api_changer = 0;
    }
    switch (client.NSFW_api_changer) {
      case 0:
        NSFW_api_key = process.env.NSFW_API_KEY_ONE;
        break;
      case 1:
        NSFW_api_key = process.env.NSFW_API_KEY_TWO;
        break;
      case 2:
        NSFW_api_key = process.env.NSFW_API_KEY_THREE;
        break;
    }
    try {
      let nsfw_check_response;
      await client.AiThrottle.add(async () => {
        nsfw_check_response = await fetch(
          "https://microsoft-content-moderator2.p.rapidapi.com/ProcessImage/Evaluate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-RapidAPI-Key": NSFW_api_key,
              "X-RapidAPI-Host": "microsoft-content-moderator2.p.rapidapi.com",
            },
            body: JSON.stringify({
              DataRepresentation: "URL",
              Value: input_url,
            }),
          },
        );
      });
      console.log(nsfw_check_response);
      if (!nsfw_check_response?.ok) {
        throw new Error("Network response was not ok");
      }
      nsfw_check_response = await nsfw_check_response.json();
      if (nsfw_check_response.Result) {
        return interaction.editReply({
          embeds: [
            client.ErrorEmbed(lang.error_title, lang.bad_image),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (error) {
      return interaction.editReply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.no_response_question),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  if (interaction.options.getSubcommand() === "age") {
    try {
      const response = await fetch("https://age-detector.p.rapidapi.com/age-detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.AGE_DETECTION_API_KEY,
          "X-RapidAPI-Host": "age-detector.p.rapidapi.com",
        },
        body: JSON.stringify({
          url: input_url,
        }),
      }).then((res) => res.json());

      const response_embed = new EmbedBuilder().setTitle(lang.indentfied_ages).setColor("#ffffff");
      let bot_answer =
        response.length === 0
          ? lang.none
          : response.map((res) => `${res.age} ${lang.years}`).join(", ");
      response_embed.setDescription(bot_answer).setImage(input_url);
      await interaction.editReply({
        embeds: [
          response_embed,
        ],
      });
    } catch (error) {
      return interaction.editReply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.no_response_question),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  if (interaction.options.getSubcommand() === "emotion") {
    try {
      const response = await fetch("https://emotion-detection2.p.rapidapi.com/emotion-detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.EMOTION_DETECTION_API_KEY,
          "X-RapidAPI-Host": "emotion-detection2.p.rapidapi.com",
        },
        body: JSON.stringify({
          url: input_url,
        }),
      }).then((res) => res.json());

      const response_embed = new EmbedBuilder()
        .setTitle(lang.indentfied_emotions)
        .setColor("#ffffff");
      let bot_answer =
        response.length === 0 ? lang.none : response.map((res) => res.emotion.value).join(", ");
      response_embed.setDescription(bot_answer).setImage(input_url);
      await interaction.editReply({
        embeds: [
          response_embed,
        ],
      });
    } catch (error) {
      return interaction.editReply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.no_response_question),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  if (interaction.options.getSubcommand() === "logo") {
    try {
      const response = await fetch("https://logo-recognition.p.rapidapi.com/logo-detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.LOGO_DETECTION_API_KEY,
          "X-RapidAPI-Host": "logo-recognition.p.rapidapi.com",
        },
        body: JSON.stringify({
          url: input_url,
        }),
      }).then((res) => res.json());

      const response_embed = new EmbedBuilder().setTitle(lang.indentfied_logos).setColor("#ffffff");
      let bot_answer =
        response.length === 0 ? lang.none : response.map((res) => res.logo).join(", ");
      response_embed.setDescription(bot_answer).setImage(input_url);
      await interaction.editReply({
        embeds: [
          response_embed,
        ],
      });
    } catch (error) {
      return interaction.editReply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.no_response_question),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

export default command;
