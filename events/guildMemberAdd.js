//const { EmbedBuilder } = require("discord.js");
//const moment = require("moment");
import { AttachmentBuilder, EmbedBuilder } from "discord.js";

import { WelcomeBuilder } from "../lib/discord-cards/index.js";
import { doesContainBadWords, textToLatin } from "deep-profanity-filter";

export default async (client, member) => {
  if (member.user.bot) return;
  const guildSettings = client.guild_settings.find((e) => e.guildId === member.guild.id);
  const settings_db = await guildSettings.settings_db.getData("/");
  const lang = client.localization_manager.getLanguage(settings_db.language);
  if (settings_db.role_on_join && member.id !== client.config.clientId) {
    try {
      member.roles.add(settings_db.role_on_join.role_on_join_id, "Autorole");
    } catch (error) {}
  }
  if (settings_db.welcome_image) {
    try {
      const Welcome_Image_Channel = client.channels.cache.get(
        settings_db.welcome_image.welcome_channel_id,
      );
      if (Welcome_Image_Channel) {
        let cv = await new WelcomeBuilder({
          avatarBorderColor:
            settings_db.welcome_image.welcome_profile_border_color === "null"
              ? "#0CA7FF"
              : settings_db.welcome_image.welcome_profile_border_color,
          colorTextDefault:
            settings_db.welcome_image.welcome_text_color === "null"
              ? "#0CA7FF"
              : settings_db.welcome_image.welcome_text_color,
          backgroundImgURL:
            settings_db.welcome_image.welcome_background === "null"
              ? null
              : settings_db.welcome_image.welcome_background,
          fontDefault: "Inter",
          mainText: {
            content: settings_db.welcome_image.welcome_text1
              .replace("{s}", Welcome_Image_Channel.guild.name)
              .replace("{n}", `${member.user.displayName}`),
          },
          nicknameText: {
            content: settings_db.welcome_image.welcome_text1.includes("{n}")
              ? member.user.username
              : member.user.displayName,
          },
          secondText: {
            content: settings_db.welcome_image.welcome_text2.replace(
              "{s}",
              Welcome_Image_Channel.guild.name,
            ),
          },
          avatarImgURL: member.user.displayAvatarURL({
            forceStatic: true,
            extension: "png",
          }),
        }).build();
        let embed = new EmbedBuilder();
        embed.setImage(`attachment://welcome.png`);
        await Welcome_Image_Channel.send({
          embeds: [
            embed,
          ],
          files: [
            new AttachmentBuilder(cv).setName("welcome.png"),
          ],
        });
      } else {
        await guildSettings.settings_db.delete("/welcome_image");
      }
    } catch (e) {
      console.log(e);
      client.error(`Failed to make a welcome card in ${member.guild.id} guild`);
    }
  }
  if (settings_db.welcome_text) {
    const Welcome_Text_Channel = client.channels.cache.get(
      settings_db.welcome_text.welcome_channel_id,
    );
    if (Welcome_Text_Channel) {
      Welcome_Text_Channel.send(
        settings_db.welcome_text.welcome_text
          .replace("{n}", `<@${member.id}>`)
          .replace("{s}", `\`${Welcome_Text_Channel.guild.name}\``),
      );
    } else {
      await guildSettings.settings_db.delete("/welcome_text");
    }
  }
  if (
    settings_db.automod_names &&
    doesContainBadWords(textToLatin(member.displayName), client.strongword_filter)
  ) {
    await member.setNickname(lang.temp_name);
  }
};
