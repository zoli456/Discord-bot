const SlashCommand = require("../../lib/SlashCommand");
const { ServerStatus } = require("@hardxploit/mc-status");
const { EmbedBuilder, InteractionContextType, AttachmentBuilder } = require("discord.js");

const command = new SlashCommand()
  .setName("minecraft")
  .setDescription("Query minecraft server's information.")
  .setNameLocalizations({
    hu: "minecraft",
  })
  .setDescriptionLocalizations({
    hu: "Lekérdezi egy Minecraft szerver adatait.",
  })
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option1) =>
    option1
      .setName("server_type")
      .setDescription("Bedrock or Java.")
      .setAutocomplete(false)
      .setRequired(true)
      .addChoices({ name: "Java", value: "Java" }, { name: "Bedrock", value: "Bedrock" })
      .setNameLocalizations({
        hu: "típus",
      })
      .setDescriptionLocalizations({
        hu: "Bedrock vagy Java a szerver.",
      }),
  )
  .addStringOption((option2) =>
    option2
      .setName("address")
      .setDescription("Address of the server")
      .setAutocomplete(false)
      .setRequired(true)
      .setNameLocalizations({
        hu: "cím",
      })
      .setDescriptionLocalizations({
        hu: "Írd be a szerver címét!",
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

    await interaction.deferReply();
    let address = options.getString("address", true).trim();
    let server_type = options.getString("server_type", true);
    let port;
    address = address.split(":");
    if (address.length === 2) {
      port = address[1];
    } else {
      port = 25565;
    }

    let data;
    if (server_type === "Java") {
      try {
        data = new ServerStatus("java", address[0], port);
        data = await data.get();
        /*await mcs.statusJava(address[0], port).then((result) => {
          data = result;
        });*/
      } catch (error) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("#880808")
              .setDescription("❌ | Hiba történt az adatok lekérdezése során."),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      if (data.online) {
        let player = "";
        let plugins = "";
        if (data.players.list.length !== 0) {
          if (data.players.list.length > 12) {
            for (let i = 0; i < 12; i++) {
              player += data.players.list[i]["name_clean"] + "\n";
            }
          } else {
            for (let i = 0; i < data.players.list.length; i++) {
              player += data.players.list[i]["name_clean"] + "\n";
            }
          }
          if (data.players.online - data.players.list.length > 0) {
            player += lang.minecraft_more_players.replace(
              "{n}",
              data.players.online - data.players.list.length,
            );
          }
        }
        if (data.plugins !== 0) {
          if (data.plugins.length > 12) {
            for (let i = 0; i < 12; i++) {
              plugins += data.plugins[i]["name"] + " " + data.plugins[i]["version"] + "\n";
            }
          } else {
            for (let i = 0; i < data.plugins.length; i++) {
              plugins += data.plugins[i]["name"] + " " + data.plugins[i]["version"] + "\n";
            }
          }
          if (data.plugins.length - 12 > 0) {
            plugins += lang.minecraft_more_plugins.replace("{n}", data.plugins.length - 12);
          }
        }
        if (data.icon) {
          const sfbuff = new Buffer.from(data.icon.split(",")[1], "base64");
          const sfattach = new AttachmentBuilder(sfbuff, {
            name: "output.png",
          });

          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor("#FFFFFF")
                .setTitle(`${data.host}:${data.port} ${lang.minecraft_status}`)
                .setDescription(`${data.motd.clean === "" ? "-" : data.motd.clean}`)
                .setThumbnail(`attachment://${sfattach.name}`)
                .setFields(
                  {
                    name: lang.type,
                    value: `Java`,
                    inline: true,
                  },
                  {
                    name: lang.population,
                    value: `${data.players.online}/${data.players.max}`,
                    inline: true,
                  },
                  {
                    name: lang.version,
                    value: `${data.version.name_clean === "" ? "-" : data.version.name_clean}`,
                    inline: true,
                  },
                  {
                    name: lang.players,
                    value: player === "" ? "-" : player,
                    inline: true,
                  },
                  {
                    name: lang.plugins,
                    value: plugins === "" ? "-" : plugins,
                    inline: true,
                  },
                )
                .setTimestamp()
                .setFooter({
                  text: interaction.guild.name,
                  iconURL: interaction.guild.iconURL(),
                }),
            ],
            files: [
              sfattach,
            ],
            ephemeral: false,
          });
        } else {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor("#FFFFFF")
                .setTitle(`${data.host}:${data.port} ${lang.minecraft_status}`)
                .setDescription(`${data.motd.clean === "" ? "-" : data.motd.clean}`)
                .setFields(
                  {
                    name: lang.type,
                    value: `Java`,
                    inline: true,
                  },
                  {
                    name: lang.population,
                    value: `${data.players.online}/${data.players.max}`,
                    inline: true,
                  },
                  {
                    name: lang.version,
                    value: `${data.version.name_clean === "" ? "-" : data.version.name_clean}`,
                    inline: true,
                  },
                  {
                    name: lang.players,
                    value: player === "" ? "-" : player,
                    inline: true,
                  },
                  {
                    name: lang.plugins,
                    value: plugins === "" ? "-" : plugins,
                    inline: true,
                  },
                )
                .setTimestamp()
                .setFooter({
                  text: interaction.guild.name,
                  iconURL: interaction.guild.iconURL(),
                }),
            ],
            ephemeral: false,
          });
        }
      } else {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${data.host}:${data.port} ${lang.minecraft_status}`)
              .setColor("#880808")
              .setDescription(lang.server_offline),
          ],
          ephemeral: false,
        });
      }
    }
    if (server_type === "Bedrock") {
      try {
        data = new ServerStatus("bedrock", address[0], port);
        data = await data.get();
      } catch (error) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("#880808")
              .setDescription(client.ErrorEmbed(lang.minecraft_failed)),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }
      if (data.online) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FFFFFF")
              .setTitle(`${data.host}:${data.port} ${lang.minecraft_status}`)
              .setDescription(`${data.motd.clean === "" ? "-" : data.motd.clean}`)
              .setFields(
                {
                  name: lang.type,
                  value: `Bedrock`,
                  inline: true,
                },
                {
                  name: lang.players,
                  value: `${data.players.online}/${data.players.max}`,
                  inline: true,
                },
                {
                  name: lang.version,
                  value: `${data.version.name === "" ? "-" : data.version.name}`,
                  inline: true,
                },
                {
                  name: lang.game_mode,
                  value: `${data.gamemode === "" ? "-" : data.gamemode}`,
                  inline: true,
                },
                {
                  name: lang.server_id,
                  value: `${data.server_id === "" ? "-" : data.server_id}`,
                  inline: true,
                },
                {
                  name: lang.edition,
                  value: `${data.edition === "" ? "-" : data.edition}`,
                  inline: true,
                },
              )
              .setTimestamp()
              .setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL(),
              }),
          ],
          ephemeral: false,
        });
      } else {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`${data.host}:${data.port} ${lang.minecraft_status}`)
              .setColor("#880808")
              .setDescription(lang.server_offline),
          ],
          ephemeral: false,
        });
      }
    }
  });
module.exports = command;
