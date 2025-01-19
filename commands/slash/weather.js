const { EmbedBuilder, InteractionContextType } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");
const moment = require("moment");

const command = new SlashCommand()
  .setName("weather")
  .setDescription("Request weather for a location")
  .setNameLocalizations({
    hu: "időjárás",
  })
  .setDescriptionLocalizations({
    hu: "Kiírja az időjárását egy városnak.",
  })
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option) =>
    option
      .setName("target-city")
      .setDescription("Target city")
      .setNameLocalizations({
        hu: "város",
      })
      .setDescriptionLocalizations({
        hu: "Melyik városra vagy kíváncsi?",
      })
      .setRequired(true),
  )
  .setRun(async (client, interaction, options) => {
    const guildSettings = client.guild_settings.find(
      (e) => e.guildId === interaction.guildId,
    );
    let lang = await guildSettings.settings_db.getData("/language");

    if (client.commandLimiter.take(interaction.member.id)) {
      client.log(
        `${interaction.guild.name}(${interaction.guildId}) | User hit the rate limit: ${interaction.user.username}(${interaction.member.id}).`,
      );
      lang = client.localization_manager.getLanguage(
        await guildSettings.settings_db.getData("/language"),
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

    const targetCity = interaction.options.getString("target-city").trim();
    let sunrise, sunset, countryName, moonPhase, moonIllumination;
    let currentTemp,
      feelsLike,
      localtime,
      humidity,
      wind,
      icon,
      windDir,
      pressure,
      weather,
      visibility,
      uvIndex,
      precip;

    try {
      const astronomyResponse = await fetch(
        `https://api.weatherapi.com/v1/astronomy.json?key=${process.env.WEATHER_APIKEY}&q=${encodeURIComponent(targetCity)}`,
      );
      const astronomyData = await astronomyResponse.json();
      if (!astronomyResponse?.ok) throw new Error("Astronomy API error");

      sunrise = astronomyData.astronomy.astro.sunrise;
      sunset = astronomyData.astronomy.astro.sunset;
      countryName = astronomyData.location.country;
      moonPhase = astronomyData.astronomy.astro.moon_phase;
      moonIllumination = astronomyData.astronomy.astro.moon_illumination;
    } catch (error) {
      lang = client.localization_manager.getLanguage(
        await guildSettings.settings_db.getData("/language"),
      );
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.no_response_question),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const weatherResponse = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_APIKEY}&q=${encodeURIComponent(targetCity)}&lang=${lang}`,
      );
      const weatherData = await weatherResponse.json();
      if (!weatherResponse?.ok) throw new Error("Weather API error");

      currentTemp = weatherData.current.temp_c;
      feelsLike = weatherData.current.feelslike_c;
      localtime = weatherData.location.localtime;
      humidity = weatherData.current.humidity;
      wind = weatherData.current.wind_kph;
      icon = weatherData.current.condition.icon;
      windDir = weatherData.current.wind_dir;
      pressure = weatherData.current.pressure_mb;
      weather = weatherData.current.condition.text;
      visibility = weatherData.current.vis_km;
      uvIndex = weatherData.current.uv;
      precip = weatherData.current.precip_mm;
    } catch (error) {
      lang = client.localization_manager.getLanguage(
        await guildSettings.settings_db.getData("/language"),
      );
      return interaction.reply({
        embeds: [
          client.ErrorEmbed(lang.error_title, lang.no_response_question),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (lang === "hu") {
      windDir = windDir
        .replaceAll("N", "É")
        .replaceAll("E", "K")
        .replaceAll("S", "D")
        .replaceAll("W", "Ny");
      sunset = moment(sunset, ["hh:mm A"]).format("HH:mm");
      sunrise = moment(sunrise, ["hh:mm A"]).format("HH:mm");
      if (countryName === "Hongrie") countryName = "Hungary"; // Bug fix
    }

    lang = client.localization_manager.getLanguage(
      await guildSettings.settings_db.getData("/language"),
    );

    const moonPhaseMap = {
      "New Moon": lang.new_moon,
      "Waxing Crescent": lang.waxing_crescent,
      "First Quarter": lang.first_quarter,
      "Waxing Gibbous": lang.waxing_gibbous,
      "Full Moon": lang.full_moon,
      "Waning Gibbous": lang.waning_gibbous,
      "Last Quarter": lang.last_quarter,
      "Waning Crescent": lang.waning_crescent,
    };

    moonPhase = moonPhaseMap[moonPhase] || moonPhase;

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle(
            lang.the_current_weather
              .replace("${weather}", weather)
              .replace("${currentTemp}", currentTemp)
              .replace("${targetCity}", targetCity)
              .replace("${countryName}", countryName),
          )
          .addFields(
            { name: lang.feels_like, value: `${feelsLike} °C`, inline: true },
            { name: lang.humidity, value: `${humidity} %`, inline: true },
            {
              name: lang.wind_speed,
              value: `${wind} ${lang.kilometerperhour} ${windDir}`,
              inline: true,
            },
            {
              name: lang.pressure,
              value: `${pressure} millibar`,
              inline: true,
            },
            { name: lang.visibility, value: `${visibility} km`, inline: true },
            { name: lang.local_time, value: localtime, inline: true },
            { name: lang.sunrise, value: sunrise, inline: true },
            { name: lang.sunset, value: sunset, inline: true },
            { name: lang.uv_index, value: uvIndex.toString(), inline: true },
            { name: lang.precip, value: `${precip} mm`, inline: true },
            { name: lang.moon_phase, value: moonPhase, inline: true },
            {
              name: lang.illumination,
              value: `${moonIllumination}%`,
              inline: true,
            },
          )
          .setTimestamp()
          .setFooter({ text: "Powered by Weatherapi" })
          .setThumbnail(`https:${icon}`),
      ],
    });
  });

module.exports = command;
