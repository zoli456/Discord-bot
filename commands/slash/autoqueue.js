const colors = require("@colors/colors");
const { EmbedBuilder, InteractionContextType } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");

const command = new SlashCommand()
  .setName("autoqueue")
  .setDescription("Automatically add songs to the queue (toggle)")
  .setNameLocalizations({
    hu: "auto_folytatás",
  })
  .setDescriptionLocalizations({
    hu: "Beállítja, hogy ha a bot végére ér a várólistának a bot tesz be kapcsolódó zenéket.",
  })
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
    let channel = await client.getChannel(client, interaction);
    if (!channel) {
      return;
    }

    let player;
    if (client.manager) {
      player = client.manager.getPlayer(interaction.guild.id);
    } else {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setDescription(lang.lavalink_not_connected),
        ],
      });
    }

    if (!player) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setDescription(lang.nothing_to_play),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    let autoQueueEmbed = new EmbedBuilder().setColor(client.config.embedColor);
    const autoQueue = player.get("autoQueue");
    player.set("requester", interaction.guild.members.me);

    if (!autoQueue || autoQueue === false) {
      player.set("autoQueue", true);
    } else {
      player.set("autoQueue", false);
    }
    autoQueueEmbed
      .setDescription(
        `${lang.auto_que_is} \`${!autoQueue ? lang.ON : lang.OFF}\``,
      )
      .setFooter({
        text: `${lang.auto_que1} ${
          !autoQueue ? lang.auto_que_option1 : lang.auto_qu2_option2
        } ${lang.auto_que2}`,
      });
    client.warn(
      `Player: ${player.options.guildId} | [${colors.blue(
        "AUTOQUEUE",
      )}] has been [${colors.blue(!autoQueue ? "ENABLED" : "DISABLED")}] in ${
        client.guilds.cache.get(player.options.guildId)
          ? client.guilds.cache.get(player.options.guildId).name
          : "a guild"
      }`,
    );

    return interaction.reply({ embeds: [autoQueueEmbed] });
  });

module.exports = command;
