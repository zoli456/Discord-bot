import {
  EmbedBuilder,
  MessageFlags,
  InteractionContextType,
  PermissionsBitField,
  time,
} from "discord.js";

import SlashCommand from "../../lib/SlashCommand.js";
import check_image from "../../lib/Image-Generation/module/functions.js";
import { JsonDB, Config } from "node-json-db";
import moment from "moment";
import ms from "ms";

const command = new SlashCommand()
  .setName("poll")
  .setDescription("Start a poll")
  .setNameLocalizations({
    hu: "szavazás",
  })
  .setDescriptionLocalizations({
    hu: "Elindít egy szavazást.",
  })
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option1) =>
    option1
      .setName("title")
      .setDescription("What should be the title of the poll?")
      .setAutocomplete(false)
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(100)
      .setNameLocalizations({
        hu: "cím",
      })
      .setDescriptionLocalizations({
        hu: "Mi legyen a címe a szavazásnak?",
      }),
  )
  .addStringOption((option2) =>
    option2
      .setName("choices")
      .setDescription("choices for pool, separeted wit commas")
      .setAutocomplete(false)
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(300)
      .setNameLocalizations({
        hu: "lehetőségek",
      })
      .setDescriptionLocalizations({
        hu: "Szavazási lehetősgek , elválasztva",
      }),
  )
  .addStringOption((option3) =>
    option3
      .setName("duration")
      .setDescription("Duration of the poll Ex 1d 1h | 2h | 80m | 53s")
      .setAutocomplete(false)
      .setRequired(true)
      .setMinLength(2)
      .setMaxLength(20)
      .setNameLocalizations({
        hu: "időtartam",
      })
      .setDescriptionLocalizations({
        hu: "Szavazás hosszúsága percben pl.: 1d 1h | 2h | 80m | 53s",
      }),
  )
  .addStringOption((option4) =>
    option4
      .setName("emoji_list")
      .setDescription("List of emoji used, separated by commas.")
      .setAutocomplete(false)
      .setRequired(false)
      .setMinLength(3)
      .setMaxLength(300)
      .setNameLocalizations({
        hu: "emoji_lista",
      })
      .setDescriptionLocalizations({
        hu: "A használt emojik listája vesszővel elválasztva.",
      }),
  )
  .addStringOption((option4) =>
    option4
      .setName("embed_color")
      .setDescription("Hex value of the color for the embed color.")
      .setAutocomplete(false)
      .setRequired(false)
      .setMinLength(7)
      .setMaxLength(7)
      .setNameLocalizations({
        hu: "beágyazás_színe",
      })
      .setDescriptionLocalizations({
        hu: "A beagyazás színe.",
      }),
  )
  .addStringOption((option5) =>
    option5
      .setName("image_link")
      .setDescription("Image for the poll.")
      .setAutocomplete(false)
      .setRequired(false)
      .setMinLength(3)
      .setMaxLength(512)
      .setNameLocalizations({
        hu: "kép_link",
      })
      .setDescriptionLocalizations({
        hu: "Kép a szavazáshoz",
      }),
  )
  .addAttachmentOption((option6) =>
    option6
      .setName("image_upload")
      .setDescription("Image for the poll.")
      .setRequired(false)
      .setNameLocalizations({
        hu: "kép_feltöltés",
      })
      .setDescriptionLocalizations({
        hu: "Kép a szavazáshoz",
      }),
  )
  .addIntegerOption((option7) =>
    option7
      .setName("limit")
      .setDescription("Maximum number of votes you can do.")
      .setAutocomplete(false)
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(9)
      .setNameLocalizations({
        hu: "limit",
      })
      .setDescriptionLocalizations({
        hu: "Ennyi szavazatot tehet a felhasználó.",
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
    if (
      interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) ||
      interaction.user.id === process.env.ADMINID
    ) {
      const defEmojiList = [
        "\u0031\u20E3", "\u0032\u20E3", "\u0033\u20E3", "\u0034\u20E3",
        "\u0035\u20E3", "\u0036\u20E3", "\u0037\u20E3", "\u0038\u20E3",
        "\u0039\u20E3", "\uD83D\uDD1F",
      ];
      const embedBuilderError = (error) =>
        new EmbedBuilder().setColor("Red").setDescription(`**❌ - ${error}**`);
      const title = options.getString("title", true);
      let choices = options.getString("choices", true).trim();
      if (choices) {
        choices = choices.split(",");
      }
      let duration = options.getString("duration", true);
      const limit = options.getInteger("limit", false) || 1;
      const emoji_list = options.getString("emoji_list", false);
      let image = options.getString("image_link", false)
        ? options.getString("image", false).trim()
        : undefined;

      let emojiArray = [];
      if (emoji_list) {
        emojiArray = emoji_list.trim().split(",");
      }
      const forceEndPollEmoji = "🔴";
      if (emojiArray.length === 0) {
        for (let i = 0; i < choices.length; i++) {
          emojiArray.push(defEmojiList[i]);
        }
      }
      let embedColor = options.getString("embed_color", false) || "#ffffff";
      // Validation

      if (image) {
        if (await check_image.validateURL(image)) {
          return interaction.editReply({
            embeds: [
              client.ErrorEmbed(lang.error_title, lang.invalid_link),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
      } else {
        image = options.getAttachment("image_upload", false);
        if (image) image = image.url;
      }

      if (!interaction && !interaction.channel) {
        return interaction.reply({
          embeds: [
            embedBuilderError("Channel is inaccessible."),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      if (!title) {
        return interaction.reply({
          embeds: [
            embedBuilderError("Poll title is not given or invalid title."),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      if (!choices || typeof choices !== "object") {
        return interaction.reply({
          embeds: [
            embedBuilderError("Poll choices are not given or invalid choices."),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      if (choices.length < 2) {
        return interaction.reply({
          embeds: [
            embedBuilderError("Please provide more than one choice."),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      if (choices.length > emojiArray.length) {
        return interaction.reply({
          embeds: [
            embedBuilderError(`The provided choices are more than the emojis.`),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      if (embedColor) {
        if (!embedColor.startsWith("#")) {
          return interaction.reply({
            embeds: [
              embedBuilderError("Embed color only accepts colors in the hex format: `#000000`"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
        if (embedColor.length !== 7 && embedColor.length !== 4) {
          return interaction.reply({
            embeds: [
              embedBuilderError("Invalid color."),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
      }

      // Duration in Discord's Epoch Timestamp
      duration = ms(duration);
      const date = new Date(new Date().getTime() + duration);
      const relative = time(date, "R");

      let text = lang.poll_description
        .replace("{relative}", relative)
        .replace("{forceEndPollEmoji}", forceEndPollEmoji)
        .replace("{limit}", limit);
      const emojiInfo = {};
      for (let i = 0; i < choices.length; i++) {
        emojiInfo[emojiArray[i]] = {
          option: emojiArray[i],
          votes: 0,
          text: choices[i],
        };
        text += `${emojiArray[i]} : \`${choices[i]}\`\n\n`;
      }

      const usedEmojis = Object.keys(emojiInfo);
      usedEmojis.push(forceEndPollEmoji); // Add the forceEnd emoji to the usedEmojis

      let embed = new EmbedBuilder()
        .setTitle(`${lang.poll_title} ${title}`)
        .setColor(embedColor)
        .setDescription(text)
        .setFooter({
          text: `${lang.poll_created_by} ${interaction.user.tag}`,
        });
      if (image) embed.setThumbnail(image);
      await interaction
        .reply({
          embeds: [
            embed,
          ],
        })
        .then(async (msg) => {
          usedEmojis.forEach((emoji) => msg.react(emoji));
          let new_poll = {};
          new_poll.starter = interaction.user.id;
          new_poll.messageId = msg.id;
          new_poll.channelId = msg.channel.id;
          new_poll.guildId = msg.guildId;
          new_poll.title = title;
          new_poll.emojis = emojiInfo;
          new_poll.voters = {};
          new_poll.limit = limit;
          new_poll.image = image;
          new_poll.embedColor = embedColor;
          new_poll.endTime = moment(Date.now()).add(duration, "ms").format("YYYY M D H m");
          new_poll.forceEndPollEmoji = forceEndPollEmoji;
          const poll_data_db = new JsonDB(
            new Config(`././info/poll/${msg.id}_poll`, false, true, "/"),
          );
          await poll_data_db.push("/", new_poll);
          const temp_entry = {
            messageId: msg.id,
            changed: false,
            poll_data: poll_data_db,
          };
          client.polls.push(temp_entry);
          await poll_data_db.save();
          client.start_poll_timer(msg.channel.id, msg.id, new_poll.endTime);
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
