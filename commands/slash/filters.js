import { EmbedBuilder, MessageFlags, InteractionContextType } from "discord.js";
import SlashCommand from "../../lib/SlashCommand.js";
import { EQList } from "lavalink-client";

const command = new SlashCommand()
  .setName("filters")
  .setDescription("Which filter do you want to use?")
  .setNameLocalizations({
    hu: "szűrő",
  })
  .setDescriptionLocalizations({
    hu: "Hozzáad vagy eltávolít egy szűrőt.",
  })
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option) =>
    option
      .setName("preset")
      .setDescription("the preset to add")
      .setRequired(true)
      .setNameLocalizations({
        hu: "név",
      })
      .setDescriptionLocalizations({
        hu: "Melyik szűrőt akarod használni?",
      })
      .addChoices(
        { name: "Nightcore", value: "nightcore" },
        { name: "BassBoost High", value: "bassboost-high" },
        { name: "BassBoost Medimum", value: "bassboost-medium" },
        { name: "BassBoost Low", value: "bassboost-low" },
        { name: "Vaporwave", value: "vaporwave" },
        { name: "Pop", value: "pop" },
        { name: "3D", value: "eightD" },
        { name: "Karaoke", value: "karaoke" },
        { name: "Vibrato", value: "vibrato" },
        { name: "Tremolo", value: "tremolo" },
        { name: "Echo", value: "echo" },
        { name: "High-pass", value: "high-pass" },
        { name: "Low-pass", value: "low-pass" },
        { name: "Normalization", value: "normalization" },
        { name: "Rock", value: "rock" },
        { name: "Classic", value: "classic" },
        { name: "Electro", value: "electro" },
        { name: "OFF", value: "off" },
      ),
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
    if (client.playerLimiter.take(interaction.guild.id)) {
      client.log(
        `${interaction.guildId} | User hit the rate limit on the player: ${interaction.user.username}(${interaction.member.id}).`,
      );
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.please_wait_button),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    const args = interaction.options.getString("preset");

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
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.lavalink_not_connected),
        ],
      });
    }

    if (!player) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder().setColor("#FF0000").setDescription(lang.no_music_playing),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    // create a new embed
    let filtersEmbed = new EmbedBuilder().setColor(client.config.embedColor);

    if (args === "nightcore") {
      filtersEmbed.setDescription("✅ | Nightcore " + lang.filter_now_active);
      await player.filterManager.toggleNightcore();
    } else if (args === "bassboost-low") {
      filtersEmbed.setDescription("✅ | BassBoost Low " + lang.filter_now_active);
      await player.filterManager.setEQ(EQList.BassboostLow);
    } else if (args === "bassboost-medium") {
      filtersEmbed.setDescription("✅ | BassBoost Medium " + lang.filter_now_active);
      await player.filterManager.setEQ(EQList.BassboostMedium);
    } else if (args === "bassboost-high") {
      filtersEmbed.setDescription("✅ | BassBoost High " + lang.filter_now_active);
      await player.filterManager.setEQ(EQList.BassboostHigh);
    } else if (args === "vaporwave") {
      filtersEmbed.setDescription("✅ | Vaporwave " + lang.filter_now_active);
      await player.filterManager.toggleVaporwave();
    } else if (args === "pop") {
      filtersEmbed.setDescription("✅ | Pop filter " + lang.filter_now_active);
      await player.filterManager.setEQ(EQList.Pop);
    } else if (args === "rock") {
      filtersEmbed.setDescription("✅ | Rock filter " + lang.filter_now_active);
      await player.filterManager.setEQ(EQList.Rock);
    } else if (args === "classic") {
      filtersEmbed.setDescription("✅ | Classic filter " + lang.filter_now_active);
      await player.filterManager.setEQ(EQList.Classic);
    } else if (args === "electro") {
      filtersEmbed.setDescription("✅ | Electro filter " + lang.filter_now_active);
      await player.filterManager.setEQ(EQList.Electronic);
    } else if (args === "eightD") {
      filtersEmbed.setDescription("✅ | 3D " + lang.filter_now_active);
      await player.filterManager.toggleRotation();
    } else if (args === "karaoke") {
      filtersEmbed.setDescription("✅ | Karaoke " + lang.filter_now_active);
      await player.filterManager.toggleKaraoke();
    } else if (args === "vibrato") {
      filtersEmbed.setDescription("✅ | Vibrato " + lang.filter_now_active);
      await player.filterManager.toggleVibrato();
    } else if (args === "tremolo") {
      filtersEmbed.setDescription("✅ | Tremolo " + lang.filter_now_active);
      await player.filterManager.toggleTremolo();
    } else if (args === "echo") {
      filtersEmbed.setDescription("✅ | Echo " + lang.filter_now_active);
      await player.filterManager.lavalinkLavaDspxPlugin.toggleEcho(0.5, 1);
    } else if (args === "high-pass") {
      filtersEmbed.setDescription("✅ | High-pass " + lang.filter_now_active);
      await player.filterManager.lavalinkLavaDspxPlugin.toggleHighPass();
    } else if (args === "low-pass") {
      filtersEmbed.setDescription("✅ | Low-pass " + lang.filter_now_active);
      await player.filterManager.lavalinkLavaDspxPlugin.toggleLowPass();
    } else if (args === "normalization") {
      filtersEmbed.setDescription("✅ | Normalization " + lang.filter_now_active);
      await player.filterManager.lavalinkLavaDspxPlugin.toggleNormalization();
    } else if (args === "off") {
      filtersEmbed.setDescription("✅ | " + lang.no_filter);
      await player.filterManager.resetFilters();
      await player.filterManager.clearEQ();
    } else {
      filtersEmbed.setDescription(lang.invalid_filters);
    }

    return interaction.reply({
      embeds: [
        filtersEmbed,
      ],
    });
  });

export default command;
