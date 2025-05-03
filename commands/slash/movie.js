import SlashCommand from "../../lib/SlashCommand.js";

import {
  EmbedBuilder,
  InteractionContextType,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  MessageFlags,
} from "discord.js";

import prettyMilliseconds from "pretty-ms";

const command = new SlashCommand()
  .setName("movie")
  .setDescription("Look up a movie.")
  .setNameLocalizations({
    hu: "film",
  })
  .setDescriptionLocalizations({
    hu: "Keres információkat egy filmről.",
  })
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option) =>
    option
      .setName("title")
      .setDescription("The title of the movie.")
      .setAutocomplete(false)
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(512)
      .setNameLocalizations({
        hu: "cím",
      })
      .setDescriptionLocalizations({
        hu: "A film címe.",
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
    const title = options.getString("title", true).trim();
    await interaction.deferReply();
    let res;
    try {
      res = await client.moviedb.searchMovie({
        query: title,
        language: await guildSettings.settings_db.getData("/language"),
        include_adult: interaction.channel.nsfw,
      });
    } catch (r) {
      return interaction.editReply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.minecraft_failed),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (res.results.length === 0) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${lang.no_results_for} \`${title}\``)
            .setColor("#FF0000"),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }
    let max = 10;
    if (res.results.length < max) {
      max = res.results.length;
    }
    let resultFromSearch = [];
    let a = 0;
    res.results.slice(0, max).map((movie) => {
      resultFromSearch.push({
        label: `${movie.title}(${movie.release_date})`.substring(0, 100),
        value: a.toString(),
        description: movie.overview === "" ? lang.no_description : movie.overview.substring(0, 100),
      });
      a++;
    });
    const menus = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("select")
        .setPlaceholder(lang.select_a_movie)
        .addOptions(resultFromSearch),
    );

    let choosenTracks = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setDescription(`${lang.choose_a_track1} \`${title}\`. ${lang.choose_a_track2}`),
      ],
      components: [
        menus,
      ],
      flags: MessageFlags.Ephemeral,
    });
    const filter = (button) => button.user.id === interaction.user.id;

    const tracksCollector = choosenTracks.createMessageComponentCollector({
      filter,
      time: 60000,
    });
    tracksCollector.on("collect", async (i) => {
      if (i.isStringSelectMenu()) {
        await i.deferUpdate();
        const movie = res.results[i.values[0]];
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(movie.title)
              .setDescription(movie.overview)
              .setThumbnail(`https://image.tmdb.org/t/p/w500${movie.poster_path}`)
              .setImage(`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`)
              .addFields(
                {
                  name: lang.original_title,
                  value: movie.original_title,
                  inline: true,
                },
                {
                  name: lang.release_date,
                  value: movie.release_date.toString(),
                  inline: true,
                },
                {
                  name: lang.rating,
                  value: movie.vote_average.toString(),
                  inline: true,
                },
              ),
          ],
          components: [],
        });
      }
    });
  });

export default command;
