import {
  EmbedBuilder,
  InteractionContextType,
  MessageFlags,
  PermissionsBitField,
} from "discord.js";
import SlashCommand from "../../lib/SlashCommand.js";
import { EType } from "../../lib/ReactionRole/types.js";
import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig.js";

const command = new SlashCommand()
  .setName("role")
  .setDescription("Change roles on the server")
  .setNameLocalizations({
    hu: "szerep",
  })
  .setDescriptionLocalizations({
    hu: "Változtatja a szerepeket a szerveren.",
  })
  .setContexts(InteractionContextType.Guild)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("everyone")
      .setDescription("Give a role to everybody.")
      .setNameLocalizations({
        hu: "mindenki",
      })
      .setDescriptionLocalizations({
        hu: "Odaadja a szerepet mindenkinek a szerveren.",
      })
      .addRoleOption((option3) =>
        option3
          .setName("role")
          .setNameLocalizations({
            hu: "szerep",
          })
          .setDescriptionLocalizations({
            hu: "Szerep amely mindekihez kerüljön.",
          })
          .setDescription("Role what I will give.")
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("nobody")
      .setDescription("Take away a role from everybody.")
      .setNameLocalizations({
        hu: "senki",
      })
      .setDescriptionLocalizations({
        hu: "Elvesz egy szerepet mindekitől.",
      })
      .addRoleOption((option3) =>
        option3
          .setName("role")
          .setNameLocalizations({
            hu: "szerep",
          })
          .setDescriptionLocalizations({
            hu: "Szerep amelyet elveszek.",
          })
          .setDescription("Role what I will take away.")
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("join")
      .setDescription("Give a role when somebody join the server.")
      .setNameLocalizations({
        hu: "csatlakozás",
      })
      .setDescriptionLocalizations({
        hu: "Ad egy szerepet amikor valaki csatlakozik a szerverhez.",
      })
      .addRoleOption((option3) =>
        option3
          .setName("role")
          .setNameLocalizations({
            hu: "szerep",
          })
          .setDescriptionLocalizations({
            hu: "Szerep amelyet adni fogok.",
          })
          .setDescription("Role what I will give you.")
          .setRequired(false),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("create-reactionrole")
      .setDescription("Create a reaction role on message.")
      .setNameLocalizations({
        hu: "új-reakció-szerep",
      })
      .setDescriptionLocalizations({
        hu: "Készít egy reakció szerepet egy üzeneten",
      })
      .addChannelOption((option1) =>
        option1
          .setName("channel")
          .setDescription("Channel for the reaction role.")
          .setNameLocalizations({
            hu: "csatorna",
          })
          .setDescriptionLocalizations({
            hu: "Csatorna ahol a reakció szerep legyen.",
          })
          .setRequired(true),
      )
      .addStringOption((option2) =>
        option2
          .setName("message_id")
          .setDescription("Message id of the target message.")
          .setNameLocalizations({
            hu: "üzenet_azonosító",
          })
          .setDescriptionLocalizations({
            hu: "Üzenet azonosító ahová kerüljön reakció szerep.",
          })
          .setRequired(true),
      )
      .addStringOption((option3) =>
        option3
          .setName("emoji")
          .setDescription("Emoji to react to.")
          .setNameLocalizations({
            hu: "emoji",
          })
          .setDescriptionLocalizations({
            hu: "Emoji amire reagálni kell.",
          })
          .setRequired(true),
      )
      .addRoleOption((option4) =>
        option4
          .setName("role")
          .setDescription("The given role for the reaction.")
          .setNameLocalizations({
            hu: "szerep",
          })
          .setDescriptionLocalizations({
            hu: "Szerep amit ad a reagálásért.",
          })
          .setRequired(true),
      )
      .addStringOption((option5) =>
        option5
          .setName("type")
          .setDescription("The type of the reaction role.")
          .setNameLocalizations({
            hu: "típus",
          })
          .setDescriptionLocalizations({
            hu: "Reakció szerep típusa.",
          })
          .setRequired(true)
          .addChoices(
            { name: "Normal", value: "Normal" },
            { name: "Once", value: "Once" },
            { name: "Remove", value: "Remove" },
            { name: "Custom", value: "Custom" },
          ),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove_reaction_role")
      .setDescription("Remove all reaction roles on message.")
      .setNameLocalizations({
        hu: "eltávolít_reakció-szerep",
      })
      .setDescriptionLocalizations({
        hu: "Eltávolítja az összes reakció szerepet.",
      })
      .addStringOption((option1) =>
        option1
          .setName("message_id")
          .setDescription("Message id of the target message.")
          .setNameLocalizations({
            hu: "üzenet_azonosító",
          })
          .setDescriptionLocalizations({
            hu: "Üzenet azonosító ahonnét töröljem a reakció rangokat.",
          })
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("limit")
      .setDescription("Limit the ammount of selectable role.")
      .setNameLocalizations({
        hu: "limit_beállítás",
      })
      .setDescriptionLocalizations({
        hu: "Beállítja a kiválasztható szerepet az üzeneten.",
      })
      .addStringOption((option1) =>
        option1
          .setName("message_id")
          .setDescription("Message id of the target message.")
          .setNameLocalizations({
            hu: "üzenet_azonosító",
          })
          .setDescriptionLocalizations({
            hu: "Üzenet azonosító ahonnét töröljem a reakció rangokat.",
          })
          .setRequired(true),
      )
      .addIntegerOption((option2) =>
        option2
          .setName("number")
          .setDescription("Number of roles you can select.")
          .setMinValue(1)
          .setMaxValue(9)
          .setNameLocalizations({
            hu: "szám",
          })
          .setDescriptionLocalizations({
            hu: "Ennyi szerepet tudsz kiválasztani.",
          })
          .setRequired(false),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("removeall_reaction_role")
      .setDescription("Remove all reaction roles.")
      .setNameLocalizations({
        hu: "minden_eltávolít_rr",
      })
      .setDescriptionLocalizations({
        hu: "Eltávolítja az összes reakció szerepet mindenhonnét.",
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
      if (interaction.options.getSubcommand() === "everyone") {
        const role = interaction.options.getRole("role", true);
        interaction.guild.members.cache.forEach((member) => {
          // Check if user has a higher role than the bot
          if (member.roles.highest.position > interaction.member.roles.highest.position) {
            return;
          }
          if (member.user.bot) return;
          try {
            member.roles.add(role, "User request");
          } catch (error) {}
        });
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | I gave everybody the `" + role.name + "` role."),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      if (interaction.options.getSubcommand() === "nobody") {
        const role = interaction.options.getRole("role", true);
        interaction.guild.members.cache.forEach((member) => {
          // Check if user has a higher role than the bot
          if (member.roles.highest.position > interaction.member.roles.highest.position) {
            return;
          }
          if (member.user.bot) return;
          try {
            member.roles.remove(role, "User request");
          } catch (error) {}
        });
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription("✅ | I took away from everybody the `" + role.name + "` role."),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      if (interaction.options.getSubcommand() === "join") {
        const settings_db = new JsonDB(
          new Config("./db/" + interaction.guildId + ".json", true, true, "/"),
        );
        const guild_settings = client.guild_settings.find((e) => e.guildId === interaction.guildId);
        let role_on_join = interaction.options.getRole("role", false);
        if (role_on_join) {
          let config = {};
          config.role_on_join_id = role_on_join.id;
          guild_settings.role_on_join = config;
          await settings_db.push("/role_on_join", config);
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription(
                  `✅ | Now user will receive the \`${role_on_join.name}\` role on join.`,
                ),
            ],
            flags: MessageFlags.Ephemeral,
          });
        } else {
          if (guild_settings.role_on_join) {
            return interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.config.embedColor)
                  .setDescription("❌ | You have already disabled the autorole."),
              ],
              flags: MessageFlags.Ephemeral,
            });
          }
          await settings_db.delete("/role_on_join");
          guild_settings.role_on_join = null;
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription(`✅ | Now user will no longer receive a role on join.`),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
      }
      if (interaction.options.getSubcommand() === "create-reactionrole") {
        const channel = interaction.options.getChannel("channel", true);
        const message_id = interaction.options.getString("message_id", true).trim();
        let target_emoji = interaction.options.getString("emoji", true).trim();
        const role = interaction.options.getRole("role", true);
        let type = interaction.options.getString("type", true);
        let emoji_id;

        if (target_emoji.split(":").length === 3) {
          emoji_id = target_emoji.split(":")[2];
          emoji_id = emoji_id.substring(0, emoji_id.length - 1);
        } else {
          emoji_id = target_emoji;
        }

        if (type === "Normal") {
          type = EType.NORMAL;
        }
        if (type === "Remove") {
          type = EType.REMOVE;
        }
        if (type === "Once") {
          type = EType.ONCE;
        }
        if (type === "Custom") {
          type = EType.CUSTOM;
        }
        const option = client.reactionRole.createOption({
          clickable_id: emoji_id,
          roles: [
            role.id,
          ],
          type: type,
        });
        const message = await channel.messages.fetch(message_id);
        await message.react(target_emoji);
        if (Object.keys(client.reactionRole.config).includes(message_id)) {
          client.reactionRole.config[message_id]["clickables"].push(option);
          let temp = client.reactionRole.config;
          client.reactionRole.config = {};
          await client.reactionRole.importConfig(temp);
        } else {
          await client.reactionRole.createMessage({
            channel_id: channel.id,
            clickables: [
              option,
            ],
            message_id: message_id,
          });
        }
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(`✅ | Succesfully set the reaction role for ${role.name}.`),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      if (interaction.options.getSubcommand() === "remove_reaction_role") {
        const message_id = interaction.options.getString("message_id", true).trim();
        await client.reactionRole.importConfig(await client.reactionRole.deleteMessage(message_id));
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setDescription(`✅ | Succesfully removed reaction roles.`),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      if (interaction.options.getSubcommand() === "removeall_reaction_role") {
        if (interaction.user.id === process.env.ADMINID) {
          for (const element of Object.keys(client.reactionRole.config)) {
            await client.reactionRole.importConfig(
              await client.reactionRole.deleteMessage(element),
            );
          }

          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription(`✅ | Succesfully removed all reaction role.`),
            ],
            flags: MessageFlags.Ephemeral,
          });
        } else {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription("❌ | You are not authorized to use this command!"),
            ],
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    } else {
      return interaction.reply({
        embeds: [
          client.ErrorEmbed("You are not authorized to use this command!"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.options.getSubcommand() === "limit") {
      const limit = interaction.options.getInteger("number", false);
      const message_id = interaction.options.getString("message_id", true).trim();
      if (!client.reactionRole.config[message_id]) {
        return interaction.reply({
          embeds: [
            client.ErrorEmbed("There isnt any reaction on this message."),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      if (limit) {
        client.reactionRole.config[message_id].limit = limit;
        await client.reactionRole.onSet(client.reactionRole.config);
      } else {
        client.reactionRole.config[message_id].limit = undefined;
        await client.reactionRole.onSet(client.reactionRole.config);
      }
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription(`✅ | Succesfully set the selection limit on the message.`),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
  });

export default command;
