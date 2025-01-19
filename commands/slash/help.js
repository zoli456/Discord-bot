const SlashCommand = require("../../lib/SlashCommand");
const {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  ComponentType,
  InteractionContextType,
} = require("discord.js");
const LoadCommands = require("../../util/loadCommands");

const command = new SlashCommand()
  .setName("help")
  .setDescription("Shows this list")
  .setContexts(InteractionContextType.Guild)
  .setRun(async (client, interaction) => {
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

    await interaction.deferReply().catch((_) => {});
    // map the commands name and description to the embed
    const commands = await LoadCommands().then((cmds) => {
      return [].concat(cmds.slash) /*.concat(cmds.context)*/;
    });
    // from commands remove the ones that have "null" in the description
    const filteredCommands = commands.filter(
      (cmd) => cmd.description != "null",
    );
    //console.log(filteredCommands);
    const totalCmds = filteredCommands.length;
    let maxPages = Math.ceil(totalCmds / client.config.helpCmdPerPage);

    // if git exists, then get commit hash
    let gitHash = "";
    try {
      gitHash = require("child_process")
        .execSync("git rev-parse --short HEAD")
        .toString()
        .trim();
    } catch (e) {
      // do nothing
      gitHash = "unknown";
    }

    // default Page No.
    let pageNo = 0;

    const helpEmbed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setAuthor({
        name: `Commands of ${client.user.username}`,
        iconURL: client.config.iconURL,
      })
      .setTimestamp()
      .setFooter({ text: `Page ${pageNo + 1} / ${maxPages}` });

    // initial temporary array
    var tempArray = filteredCommands.slice(
      pageNo * client.config.helpCmdPerPage,
      pageNo * client.config.helpCmdPerPage + client.config.helpCmdPerPage,
    );

    tempArray.forEach((cmd) => {
      helpEmbed.addFields({ name: cmd.name, value: cmd.description });
    });
    helpEmbed.addFields({
      name: "Credits",
      value:
        `Cait Bot Version: v${
          require("../../package.json").version
        }; Build: ${gitHash}` +
        "\n" +
        `[✨ Support Server](${client.config.supportServer}) | [Issues](${client.config.Issues}) | [Source](https://github.com/SudhanPlayz/Discord-MusicBot/tree/v5) | [Invite Me](https://discord.com/oauth2/authorize?client_id=${client.config.clientId}&permissions=${client.config.permissions}&scope=bot%20applications.commands)`,
    });

    // Construction of the buttons for the embed
    const getButtons = (pageNo) => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("help_cmd_but_2_app")
          .setEmoji("◀️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(pageNo == 0),
        new ButtonBuilder()
          .setCustomId("help_cmd_but_1_app")
          .setEmoji("▶️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(pageNo == maxPages - 1),
      );
    };

    const tempMsg = await interaction.editReply({
      embeds: [helpEmbed],
      components: [getButtons(pageNo)],
    });
    const collector = tempMsg.createMessageComponentCollector({
      time: 180000,
      componentType: ComponentType.Button,
      idle: 30000,
    });

    collector.on("collect", async (iter) => {
      if (iter.customId === "help_cmd_but_1_app") {
        pageNo++;
      } else if (iter.customId === "help_cmd_but_2_app") {
        pageNo--;
      }

      const helpEmbed = new EmbedBuilder();

      var tempArray = filteredCommands.slice(
        pageNo * client.config.helpCmdPerPage,
        pageNo * client.config.helpCmdPerPage + client.config.helpCmdPerPage,
      );

      tempArray.forEach((cmd) => {
        //console.log(cmd);
        helpEmbed
          .addFields({ name: cmd.name, value: cmd.description })
          .setFooter({ text: `Page ${pageNo + 1} / ${maxPages}` });
      });
      helpEmbed.addFields({
        name: "Credits",
        value:
          `Cait Bot Version: v${
            require("../../package.json").version
          }; Build: ${gitHash}` +
          "\n" +
          `[✨ Support Server](${client.config.supportServer}) | [Issues](${client.config.Issues}) | [Source](https://github.com/SudhanPlayz/Discord-MusicBot/tree/v5) | [Invite Me](https://discord.com/oauth2/authorize?client_id=${client.config.clientId}&permissions=${client.config.permissions}&scope=bot%20applications.commands)`,
      });
      await iter.update({
        embeds: [helpEmbed],
        components: [getButtons(pageNo)],
      });
    });
    collector.on("end", async (iter) => {
      await tempMsg.edit({
        content: null,
        embeds: [
          new EmbedBuilder()
            .setDescription(lang.time_is_up)
            .setColor(client.config.embedColor),
        ],
        components: [],
        flags: MessageFlags.Ephemeral,
      });
      setTimeout(() => interaction.deleteReply(), 30000);
    });
  });

module.exports = command;
