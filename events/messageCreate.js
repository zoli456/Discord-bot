import { EmbedBuilder, MessageFlags, PermissionsBitField } from "discord.js";
import fs from "node:fs";
import { encode } from "@msgpack/msgpack";
import IsInvitation from "is-discord-invite";
import clone from "../lib/discord-cloner/index.js";
import { textToLatin, doesContainBadWords, findBadWordLocations } from "deep-profanity-filter";
import { tall } from "tall";
import { numberEmojis } from "../util/Data.js";
import UpdateCommands from "../deploy/deployGlobal.js";
import { check } from "../lib/easy-anti-fishing/checker.js";

export default async (client, message) => {
  if (
    !message.author ||
    message.author.bot ||
    message.webhookId ||
    message.channel.isDMBased() ||
    message.content === ""
  )
    return;

  const guild_settings = client.guild_settings.find((e) => e.guildId === message.guild.id);
  const settingsDb = await guild_settings.settings_db.getData("/");
  const lang = client.localization_manager.getLanguage(settingsDb.language);
  const lang_mode = settingsDb.language;

  if (
    settingsDb.automod_trap_channel &&
    settingsDb.automod_trap_channel.channel_id === message.channelId &&
    !message.member.permissions.has(PermissionsBitField.Flags.Administrator) &&
    message.member.id !== message.guild.ownerId
  ) {
    const punishment = settingsDb.automod_trap_channel.punishment;
    if (punishment === "kick" && message.member.kickable) {
      await message.member.kick("Automod Trap Channel");
    } else if (punishment === "ban" && message.member.bannable) {
      await message.member.ban({
        deleteMessageSeconds: 60,
        reason: "Automod Trap Channel",
      });
    }
    return;
  }

  if (settingsDb.word_game && message.channelId === settingsDb.word_game.word_game_channel_id) {
    if (
      message.content.startsWith("-") ||
      message.content.startsWith("/") ||
      message.content.startsWith("#") ||
      message.content.startsWith(";") ||
      message.content.startsWith("?")
    ) {
      return;
    }
    const word = message.content.toLowerCase().trim();
    if (lang_mode === "hu") {
      if (/\d|\s/.test(word) || word.length > 68 || !/[a-záéíóöőúüű]/.test(word.slice(-1))) {
        await message.delete();
        return;
      }
    } else {
      if (/\d|\s/.test(word) || word.length > 68 || !/[a-z]/.test(word.slice(-1))) {
        await message.delete();
        return;
      }
    }

    if (client.wordgame_Limiter.take(message.guild.id)) {
      await message.delete();
      return;
    }

    const word_game_data = client.wordgame_status.find((e) => e.guildId === message.guildId);
    const badTurn = async (message) => {
      fs.writeFile(
        `./info/wordgame/${message.guild.id}_wordgame.json`,
        encode(word_game_data),
        null,
        function writeJSON(err) {
          if (err) return console.log(err);
        },
      );
      message.react("❌");
      word_game_data.chain = 0;
      word_game_data.last_correct = "-";
      word_game_data.last_correct_author = "-";
      await updateWordGame(
        message.channel,
        settingsDb.word_game.word_game_msg_id,
        word_game_data,
        lang,
        settingsDb,
        guild_settings,
      );
    };

    const addEmoji = async (message, chain, client) => {
      await message.react("✅").catch(console.error);
      const emojis = chain
        .toString()
        .split("")
        .map((num) => numberEmojis.find((ne) => ne.string === num)?.emojis[0]);
      for (const emoji of emojis) {
        if (emoji) {
          await message.react(emoji).catch(console.error);
        }
      }
    };

    const updateWordGame = async (
      channel,
      wordgame_channel,
      word_game_data,
      lang,
      settingsDb,
      guild_settings,
    ) => {
      const wordgame_message = await channel.messages
        .fetch(wordgame_channel)
        .catch(() => undefined);
      const embed = new EmbedBuilder()
        .setColor("#000000")
        .setTitle(lang.wordgame_title)
        .setDescription(lang.wordgame_description)
        .addFields(
          {
            name: lang.total_correct_word,
            value: word_game_data.total_correct.toString(),
            inline: true,
          },
          {
            name: lang.current_chain,
            value: word_game_data.chain.toString(),
            inline: true,
          },
          {
            name: lang.last_correct_word,
            value: word_game_data.last_correct.toString(),
            inline: true,
          },
          {
            name: lang.longest_word,
            value: word_game_data.longest_word.toString(),
            inline: true,
          },
          {
            name: lang.longest_word_author,
            value:
              word_game_data.longest_author === "-"
                ? "-"
                : `<@${word_game_data.longest_author.toString()}>`,
            inline: true,
          },
        )
        .setTimestamp()
        .setFooter({
          text: channel.guild.name,
          iconURL: channel.guild.iconURL(),
        });

      if (wordgame_message) {
        await wordgame_message.edit({
          embeds: [
            embed,
          ],
        });
      } else {
        const new_message = await channel.send({
          embeds: [
            embed,
          ],
        });
        const temp_entry = {
          word_game_channel_id: settingsDb.word_game.word_game_channel_id,
          word_game_length: settingsDb.word_game.word_game_length,
          word_game_msg_id: new_message.id,
        };
        await guild_settings.settings_db.push("/word_game", temp_entry);
        await new_message.pin();
      }
    };

    const sendErrorMessage = async (message, description, title) => {
      const msg = await message.channel.send({
        embeds: [
          client.ErrorEmbed(title, description),
        ],
      });
      setTimeout(() => msg.delete(), 10000);
    };
    const sendWarningMessage = async (message, description, title) => {
      const msg = await message.channel.send({
        embeds: [
          client.WarningEmbed(title, description),
        ],
      });
      setTimeout(() => msg.delete(), 10000);
    };

    if (word.length <= 1) {
      await message.delete();
      await sendWarningMessage(message, lang.not_enough_char, lang.warning_title);
      return;
    }

    if (word_game_data.used_word.includes(word)) {
      await message.delete();
      await sendWarningMessage(message, lang.already_used_word, lang.warning_title);
      return;
    }

    if (word_game_data.chain > 0) {
      if (message.author.id === word_game_data["last_correct_author"]) {
        message.delete();
        await sendWarningMessage(message, lang.not_your_turn, lang.warning_title);
        return;
      }
      let is_correct_letter = false;
      const prev_letter = word_game_data.last_correct.slice(-1);
      const current_letter = word[0];
      let found_last_letters;

      if (lang_mode === "hu") {
        const current_letters = word.slice(0, 2);
        const last_letters = word_game_data.last_correct.slice(-2);
        found_last_letters = [
          "cs", "sz", "ny", "ly",
          "zs", "gy", "ty",
        ].find((x) => x === last_letters);
        is_correct_letter = current_letters === found_last_letters;
        if (!is_correct_letter) {
          is_correct_letter = current_letter === prev_letter;
        }
      } else {
        is_correct_letter = current_letter === prev_letter;
      }

      if (!is_correct_letter) {
        await badTurn(message);
        await sendWarningMessage(
          message,
          lang.badword1.replace(
            "${prev_letter}",
            found_last_letters ? `${prev_letter} vagy ${found_last_letters}` : prev_letter,
          ),
          lang.warning_title,
        );
        return;
      }
    }
    if (!client.wordgame_cache.includes(word)) {
      const wiktionaryUrl = `https://${lang_mode}.wiktionary.org/w/api.php?action=opensearch&format=json&formatversion=2&search=${word}`;
      const fetchWiktionary = async (url) => {
        try {
          const response = await fetch(url);
          if (!response?.ok) throw new Error("Network response was not ok");
          return await response.json();
        } catch (error) {
          return null;
        }
      };

      const data = await fetchWiktionary(wiktionaryUrl);
      if (!data) {
        await sendErrorMessage(message, lang.failed_to_check_word1);
        return;
      }
      if (data[1].some((x) => x.toLowerCase() === word)) {
        client.wordgame_cache.push(word);
      } else {
        if (lang_mode !== "en") {
          const en_wiktionaryUrl = `https://en.wiktionary.org/w/api.php?action=opensearch&format=json&formatversion=2&search=${word}`;
          const en_data = await fetchWiktionary(en_wiktionaryUrl);
          if (!en_data) {
            await sendErrorMessage(message, lang.failed_to_check_word1);
            return;
          }
          if (en_data[1].some((x) => x.toLowerCase() === word)) {
          } else {
            client.wordgame_cache.push(word);
            await badTurn(message);
            await sendWarningMessage(message, lang.badword2, lang.warning_title);
            return;
          }
        } else {
          await badTurn(message);
          await sendWarningMessage(message, lang.badword2, lang.warning_title);
          return;
        }
      }
    }
    word_game_data.chain++;
    word_game_data.last_correct = word;
    word_game_data.total_correct++;
    word_game_data.last_correct_author = message.author.id;
    if (word_game_data.longest_word.length < word.length) {
      word_game_data.longest_word = word;
      word_game_data.longest_author = message.member.id;
    }
    word_game_data.used_word.push(word);

    addEmoji(message, word_game_data.chain, client);

    if (settingsDb.word_game.word_game_length <= word_game_data.total_correct) {
      const pinnedMessages = await message.channel.messages.fetchPinned();
      for (const pinnedMsg of pinnedMessages.values()) {
        await pinnedMsg.unpin().catch(console.error);
        await pinnedMsg.delete().catch(console.error);
      }

      Object.assign(word_game_data, {
        guildId: message.guild.id,
        chain: 0,
        total_correct: 0,
        last_correct: "-",
        last_correct_author: "-",
        longest_word: "-",
        longest_author: "-",
        used_word: [],
      });

      await message.channel.send({
        embeds: [
          new EmbedBuilder().setColor("#FFFFFF").setDescription(lang.wordgame_over),
        ],
      });

      const new_message = await client.setupWordgame(message.guild, lang, message.channel);
      const temp_entry = {
        word_game_channel_id: settingsDb.word_game.word_game_channel_id,
        word_game_length: settingsDb.word_game.word_game_length,
        word_game_msg_id: new_message.id,
      };
      await guild_settings.settings_db.push("/word_game", temp_entry);
      await new_message.pin();
    } else {
      fs.writeFile(
        `./info/wordgame/${message.guild.id}_wordgame.json`,
        encode(word_game_data),
        null,
        function writeJSON(err) {
          if (err) return console.log(err);
        },
      );
      await updateWordGame(
        message.channel,
        settingsDb.word_game.word_game_msg_id,
        word_game_data,
        lang,
        settingsDb,
        guild_settings,
      );
    }
    return;
  }

  if (
    message.author.id === process.env.ADMINID &&
    message.content.match(`^<@${client.config.clientId}> deploy$`)
  ) {
    UpdateCommands();
    return message.channel
      .send({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setDescription("✅ | Commands successfully configured!"),
        ],
        flags: MessageFlags.Ephemeral,
      })
      .then((msg) => {
        message.delete();
        setTimeout(() => msg.delete(), 15000);
      });
  }
  if (
    message.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
    message.member.id === message.guild.ownerId
  )
    return;
  const matched_data = [
    ...message.content.matchAll(
      "(http(s)?:\\/\\/.)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)",
    ),
  ];
  if (matched_data.length > 0) {
    if (settingsDb.automod_invite) {
      let punish = false;
      let check_result;
      const memberHasIgnoredRoles =
        typeof settingsDb.automod_invite.ignored_role === "function"
          ? settingsDb.automod_invite.ignored_role(message.member.roles.cache)
          : settingsDb.automod_invite.ignored_role.some((r) => message.member.roles.cache.has(r));
      if (!memberHasIgnoredRoles) {
        if (client.invitespam_limiter.take(message.author.id)) {
          message.delete().catch((error) => {});
          return;
        }
        const checked_data = await checkData(client, message, matched_data, lang);
        if (checked_data === "") return;
        if (settingsDb.automod_invite.method === "accurate") {
          check_result = await IsInvitation.online(checked_data);
        } else {
          punish = IsInvitation.regex(checked_data);
        }
        if (settingsDb.automod_invite.method === "accurate") {
          if (check_result.success) {
            punish = check_result.isInvitation && check_result.guild.id !== message.guild.id;
          } else {
            punish = IsInvitation.regex(checked_data);
          }
        }
      }
      if (punish) {
        message.channel
          .send({
            embeds: [
              client.WarningEmbed(lang.warning_title, lang.dont_post_invite),
            ],
          })
          .then((msg) => {
            setTimeout(() => msg.delete(), 20000);
          });
        switch (settingsDb.automod_invite.punishment) {
          case "kick": {
            if (message.member.kickable) await message.member.kick("Automod Invite");
            break;
          }
          case "delete": {
            break;
          }
          case "ban": {
            if (message.member.bannable)
              await message.member.ban({
                reason: "Automod Invite",
              });
            break;
          }
          default: {
            const time_in_min = settingsDb.automod_invite.punishment.split(" ")[1];
            if (message.member.manageable)
              await message.member.timeout(time_in_min * 60 * 1000, "Automod Invite");
            break;
          }
        }
        await message.delete().catch((error) => {});
        return;
      }
    }
    if (settingsDb.automod_links) {
      const memberHasIgnoredRoles =
        typeof settingsDb.automod_links.ignored_role === "function"
          ? settingsDb.automod_links.ignored_role(message.member.roles.cache)
          : settingsDb.automod_links.ignored_role.some((r) => message.member.roles.cache.has(r));
      if (!memberHasIgnoredRoles) {
        if (client.linkspam_limiter.take(message.author.id)) {
          message.delete().catch((error) => {});
          return;
        }
        const checked_data = await checkData(client, message, matched_data, lang);
        if (checked_data === "") return;
        const checker = await check(checked_data);
        if (checker && checker.match) {
          message.channel
            .send({
              embeds: [
                client.WarningEmbed(lang.warning_title, lang.automod_links_bad_link),
              ],
            })
            .then((msg) => {
              setTimeout(() => msg.delete(), 20000);
            });
          switch (settingsDb.automod_links.punishment) {
            case "kick": {
              if (message.member.kickable) await message.member.kick("Automod Link");
              break;
            }
            case "ban": {
              if (message.member.bannable)
                await message.member.ban({
                  reason: "Automod Link",
                });
              break;
            }
            case "delete": {
              break;
            }
            default: {
              const time_in_min = settingsDb.automod_links.punishment.split(" ")[1];
              if (message.member.manageable)
                await message.member.timeout(time_in_min * 60 * 1000, "Automod Link");
              break;
            }
          }
          await message.delete().catch((error) => {});
          return;
        }
      }
    }
  }

  if (settingsDb.automod_messages) {
    const isChannelIgnored =
      typeof settingsDb.automod_messages.ignored_channel === "function"
        ? settingsDb.automod_messages.ignored_channel(message.channel)
        : settingsDb.automod_messages.ignored_channel.includes(message.channel.id);

    const memberHasIgnoredRoles =
      typeof settingsDb.automod_messages.ignored_role === "function"
        ? settingsDb.automod_messages.ignored_role(message.member.roles.cache)
        : settingsDb.automod_messages.ignored_role.some((r) => message.member.roles.cache.has(r));
    if (!isChannelIgnored && !memberHasIgnoredRoles) {
      if (settingsDb.automod_messages.censoring_method !== "replace" || matched_data.length > 0) {
        if (doesContainBadWords(textToLatin(message.content), client.strongword_filter)) {
          await message.channel
            .send({
              embeds: [
                client.WarningEmbed(lang.warning_title, lang.bad_word_on_image),
              ],
            })
            .then((msg) => {
              setTimeout(() => msg.delete(), 10000);
            });
          message.delete().catch((error) => {});
          return;
        }
      } else {
        try {
          let final_text = message.content;
          const badwords = findBadWordLocations(
            textToLatin(message.content),
            client.strongword_filter,
          );
          let temp = 0;
          let last_word = "";
          for (let i = 0; i < badwords.length; i++) {
            if (last_word !== badwords[i].word) {
              let splitter = final_text.substring(0, badwords[i].startIndex);
              if (splitter.includes("|")) {
                temp = splitter.match(/\|/g).length;
              }
              final_text = insertAtIndex(final_text, "||", badwords[i].startIndex + temp);
              final_text = insertAtIndex(
                final_text,
                "||",
                badwords[i].startIndex + badwords[i].length + temp + 2,
              );
            }
            last_word = badwords[i].word;
          }
          if (badwords.length > 0) {
            await clone.cloneMsg(client, {
              spoof: true,
              message: message,
              channel: message.channel,
              customMessage: final_text,
            });
            message.delete().catch((error) => {});
            return;
          }
        } catch (e) {
          await message.channel
            .send({
              embeds: [
                client.WarningEmbed(lang.warning_title, lang.bad_word_on_image),
              ],
            })
            .then((msg) => {
              setTimeout(() => msg.delete(), 10000);
            });
          message.delete().catch((error) => {});
          return;
        }
      }
    }
  }

  if (settingsDb.automod_spam) {
    await client.antiSpam.message(message, lang, settingsDb.automod_spam);
  }
};

function insertAtIndex(str, substring, index) {
  return str.slice(0, index) + substring + str.slice(index);
}
async function checkData(client, message, matched_data, lang) {
  let checked_data;
  for (let i = 0; i < matched_data.length; i++) {
    if (client.is_it_shortened(matched_data[i][0])) {
      if (!client.shorturl_cache[matched_data[i][0]]) {
        try {
          await tall(matched_data[i][0]).then(function (unshortenedUrl) {
            checked_data += `${unshortenedUrl} `;
            client.shorturl_cache[matched_data[i][0]] = unshortenedUrl;
          });
        } catch (err) {
          await message.channel
            .send({
              embeds: [
                client.WarningEmbed(lang.warning_title, lang.automod_url_shortener),
              ],
            })
            .then((msg) => {
              setTimeout(() => msg.delete(), 20000);
            });
          await message.delete().catch((error) => {});
          return "";
        }
      } else {
        checked_data += `${client.shorturl_cache[matched_data[i][0]]} `;
      }
    } else {
      checked_data += `${matched_data[i][0]} `;
    }
  }
  return checked_data;
}
