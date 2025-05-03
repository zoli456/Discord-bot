import SlashCommand from "../../lib/SlashCommand.js";
import moment from "moment";
import "moment-duration-format";
import { EmbedBuilder, MessageFlags, InteractionContextType } from "discord.js";
import os from "os";

const command = new SlashCommand()
  .setName("stats")
  .setDescription("Get information about the bot")
  .setNameLocalizations({
    hu: "statisztikák",
  })
  .setDescriptionLocalizations({
    hu: "Kiírja a bot információit.",
  })
  .setContexts(InteractionContextType.Guild)
  .addBooleanOption((option) =>
    option
      .setName("hidden")
      .setDescription("Should be hidden the answer?")
      .setNameLocalizations({
        hu: "rejtett",
      })
      .setDescriptionLocalizations({
        hu: "Rejtett legyen a válasz?",
      })
      .setRequired(false),
  )
  .setRun(async (client, interaction) => {
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
    if (interaction.user.id === process.env.ADMINID) {
      let hidden_answer = interaction.options.getBoolean("hidden", false);
      if (!hidden_answer) hidden_answer = false;
      // get OS info
      const osver = os.platform() + " " + os.release();

      // Get nodejs version
      const nodeVersion = process.version;

      // get the uptime in a human readable format
      const runtime = moment
        .duration(client.uptime)
        .format("d[ Days]・h[ Hrs]・m[ Mins]・s[ Secs]");
      // show lavalink uptime in a nice format
      const lavauptime = moment
        .duration(client.manager.nodeManager.nodes.values().next().value.stats.uptime)
        .format(" D[d], H[h], m[m]");
      // show lavalink memory usage in a nice format
      const lavaram = (
        client.manager.nodeManager.nodes.values().next().value.stats.memory.used /
        1024 /
        1024
      ).toFixed(2);
      // sow lavalink memory alocated in a nice format
      const lavamemalocated = (
        client.manager.nodeManager.nodes.values().next().value.stats.memory.allocated /
        1024 /
        1024
      ).toFixed(2);
      // show system uptime
      var sysuptime = moment
        .duration(os.uptime() * 1000)
        .format("d[ Days]・h[ Hrs]・m[ Mins]・s[ Secs]");

      // get commit hash and date
      let gitHash = "unknown";
      try {
        gitHash = require("child_process").execSync("git rev-parse HEAD").toString().trim();
      } catch (e) {
        // do nothing
        gitHash = "unknown";
      }
      let apiPing = client.ws.ping;
      const statsEmbed = new EmbedBuilder()
        .setTitle(`${client.user.username} Information`)
        .setColor(client.config.embedColor)
        .setDescription(
          `\`\`\`yml\nName: ${client.user.username}#${client.user.discriminator} [${client.user.id}]\nAPI: ${apiPing}ms\nRuntime: ${runtime}\`\`\``,
        )
        .setFields([
          {
            name: `Lavalink stats`,
            value: `\`\`\`yml\nUptime: ${lavauptime}\nRAM: ${lavaram} MB\nPlaying: ${
              client.manager.nodeManager.nodes.values().next().value.stats.playingPlayers
            } out of ${client.manager.nodeManager.nodes.values().next().value.stats.players}\`\`\``,
            inline: true,
          }, {
            name: "Bot stats",
            value: `\`\`\`yml\nGuilds: ${
              client.guilds.cache.size
            }\nNodeJS: ${nodeVersion}\nDiscord.js: v${
              require("../../package.json").dependencies["discord.js"]
            }\`\`\``,
            inline: true,
          }, {
            name: "System stats",
            value: `\`\`\`yml\nOS: ${osver}\nUptime: ${sysuptime}\n\`\`\``,
            inline: false,
          },
        ])
        .setFooter({
          text: `Build: ${gitHash} Caitlyn Bot: v${require("../../package.json").version}`,
        });
      if (hidden_answer) {
        return interaction.reply({
          embeds: [
            statsEmbed,
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        return interaction.reply({
          embeds: [
            statsEmbed,
          ],
        });
      }
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
