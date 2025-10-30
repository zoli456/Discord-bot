import {
  Client,
  EmbedBuilder,
  Collection,
  ActionRowBuilder,
  ButtonBuilder,
  escapeMarkdown,
  GatewayIntentBits,
  ButtonStyle,
  Partials,
  Events,
  PermissionsBitField,
} from "discord.js";

import fs from "fs";
import path, { join, basename } from "path";
import prettyMilliseconds from "pretty-ms";
import { LavalinkManager } from "lavalink-client";
import ConfigFetcher from "../util/getConfig.js";
import Logger from "./Logger.js";

//const Server = require("../api");
import getLavalink from "../util/getLavalink.js";

import getChannel from "../util/getChannel.js";
import colors from "@colors/colors";
import schedule from "node-schedule";
import { RateLimiter } from "discord.js-rate-limiter";
import momentDurationFormatSetup from "moment-duration-format";
import AntiSpam from "./anti-spam.js";
import { GiveawaysManager } from "discord-giveaways";
import { open } from "node:fs/promises";
import { decode } from "@msgpack/msgpack";
import InvitesTracker from "@androz2091/discord-invites-tracker";
import localization_manager from "./locale.js";
import PrettyError from "pretty-error";
import content_filter from "deep-profanity-filter";
import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig.js";
import { XMLParser } from "fast-xml-parser";
import { TwitchApi } from "node-twitch";
import { MovieDb } from "./moviedb-promise/index.js";
import PromiseThrottle from "promise-throttle";
import YoutubeChecker from "../lib/YoutubeChecker.js";
import { ReactionRole } from "./ReactionRole/ReactionRole.js";
import { TempChannelsManager } from "./Temp-Channels/TempChannelsManager.js";
import { TempChannelsManagerEvents } from "./Temp-Channels/TempChannelsManagerEvents.js";
import { pathToFileURL } from "url";
const __dirname = import.meta.dirname;
import { createRequire } from "module";
import { badwords, strong_words } from "../util/Data.js";
const require = createRequire(import.meta.url);
import { readdir } from "fs/promises";
import moment from "moment";

let client;

class DiscordMusicBot extends Client {
  /**
   * Create the music client
   * @param {import("discord.js").ClientOptions} props - Client options
   */
  constructor(
    props = {
      intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildEmojisAndStickers,
      ],
      partials: [
        Partials.Channel, Partials.Message, Partials.Reaction,
      ],
    },
  ) {
    super(props);

    ConfigFetcher().then((conf) => {
      this.config = conf;
      this.build();
    });

    //Load Events and stuff
    this.slashCommands = new Collection();
    this.contextCommands = new Collection();

    this.logger = new Logger(path.join(__dirname, "..", "logs.log"));

    this.tempchannel_owners = Array();
    this.tempChannelsmanager = new TempChannelsManager(this);

    this.tempChannelsmanager.on(TempChannelsManagerEvents.childAdd, (child, parent) => {
      this.logger.log(
        `${colors.blue(child.owner.guild.name)}(${child.owner.guild.id}) | Created a new channel by ${colors.blue(child.owner.user.username)}(${child.owner.id})`,
      );
      this.tempchannel_owners.push({
        channelID: child.voiceChannel.id,
        owner: child.owner.id,
      });
    });
    this.tempChannelsmanager.on(TempChannelsManagerEvents.childRemove, (child, parent) => {
      this.logger.log(
        `${colors.blue(child.owner.guild.name)}(${child.owner.guild.id}) | A temporary channel has been removed`,
      );
      const index = this.tempchannel_owners
        .map(function (element) {
          return element.channelID;
        })
        .indexOf(child.voiceChannel.id);
      if (index > -1) {
        this.tempchannel_owners.splice(index, 1);
      }
    });

    this.deletedMessages = new WeakSet();
    this.getLavalink = getLavalink;
    this.getChannel = getChannel;
    this.commandsRan = 0;
    this.songsPlayed = 0;
  }

  /**
   * Send an info message
   * @param {string} text
   */
  log(text) {
    this.logger.log(text);
  }

  /**
   * Send an warning message
   * @param {string} text
   */
  warn(text) {
    this.logger.warn(text);
  }

  /**
   * Send an error message
   * @param {string} text
   */
  error(text) {
    this.logger.error(text);
  }

  /**
   * Build em
   */
  build() {
    this.warn("Started the bot...");

    //this.server = this.config.website?.length ? new Server(this) : null; // constructing also starts it; Do not start server when no website configured
    const pe = new PrettyError();
    /*const hook = new webhook.Webhook(
      "https://discord.com/api/webhooks/",
    );*/

    if (this.config.debug === true) {
      this.warn("Debug mode is enabled!");
      this.warn("Only enable this if you know what you are doing!");
      process.on("unhandledRejection", (error) => {
        this.logger.error(pe.render(error));
        /*try {
          hook.err(
            "Hibajelentő",
            pe.render(error, false, false).slice(0, 1020),
          );
        } catch {}*/
      });
      process.on("uncaughtException", (error) => {
        this.logger.error(pe.render(error));
        /*  try {
          hook.err(
            "Hibajelentő",
            pe.render(error, false, false).slice(0, 1020),
          );
        } catch {}*/
      });
    } else {
      process.on("unhandledRejection", (error) => {});
      process.on("uncaughtException", (error) => {});
    }

    client = this;

    this.localization_manager = new localization_manager();
    this.guild_settings = Array();
    this.trivia_games = Array();
    this.url_shorteners = Array();

    this.postThrottle = new PromiseThrottle({
      requestsPerSecond: 1, // up to 1 request per second
      promiseImplementation: Promise, // the Promise library you are using
    });

    this.imageGeneratorThrottle = new PromiseThrottle({
      requestsPerSecond: 0.5,
      promiseImplementation: Promise,
    });

    this.PopcatThrottle = new PromiseThrottle({
      requestsPerSecond: 0.5,
      promiseImplementation: Promise,
    });

    this.AiThrottle = new PromiseThrottle({
      requestsPerSecond: 0.5,
      promiseImplementation: Promise,
    });

    client.on(Events.MessageReactionAdd, async (reaction, user) => {
      if (user.bot) return;
      await this.reactionRole.reaction(client, reaction, user);
      await this.poll_add_vote(reaction, user);
    });
    client.on(Events.MessageReactionRemove, async (reaction, user) => {
      if (user.bot) return;
      await this.reactionRole.unreaction(client, reaction, user);
      await this.poll_remove_vote(reaction, user);
    });

    this.shorturl_cache = [];

    this.linkspam_limiter = new RateLimiter(1, 1000);
    this.invitespam_limiter = new RateLimiter(1, 1000);

    this.commandLimiter = new RateLimiter(1, 4000);
    this.playerLimiter = new RateLimiter(1, 1000);
    this.wordgame_Limiter = new RateLimiter(1, 1500);
    this.tempchannel_Limiter = new RateLimiter(3, 60000);
    this.tempchannel_namechange_Limiter = new RateLimiter(2, 120000);
    this.nameday_channels = [];
    this.wordgame_status = Array();
    this.wordgame_cache = Array();
    this.last_cache_size = 0;

    this.logo_data = JSON.parse(fs.readFileSync("./info/logos.json"));
    this.country_data = JSON.parse(fs.readFileSync("./info/countries.json"));
    this.worddb_writer = fs.createWriteStream(`./info/word_db.txt`, { flags: "a" });

    client.tracker = InvitesTracker.init(client, {
      fetchGuilds: true,
      fetchVanity: true,
      fetchAuditLogs: true,
    });
    this.feed_list = Array();
    this.twitch_list = Array();
    this.youtube_list = Array();

    this.reactionRole = new ReactionRole(client);
    this.polls = Array();
    this.init();
  }
  async init() {
    await this.LoadCommands();
    await this.LoadEvents();
    client.tracker.on("guildMemberAdd", async (member, type, invite) => {
      let inviter;

      if (type === "normal") {
        inviter = invite.inviter.id;
      } else if (type === "vanity") {
        inviter = "vanity link";
      } else if (type === "permissions") {
        inviter = "error";
      } else if (type === "unknown") {
        inviter = "-";
      }
      const guildSettings = client.guild_settings.find((e) => e.guildId === member.guild.id);
      if (await guildSettings.settings_db.exists("/log_channel")) {
        const log_settings = await guildSettings.settings_db.getData("/log_channel");
        const lang = client.localization_manager.getLanguage(
          guildSettings.settings_db.data.language,
        );
        const log_channel = client.channels.cache.get(log_settings.log_channel_id);
        moment.locale(guildSettings.settings_db.data.language);
        log_channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#aaff00")
              .setAuthor({
                name: member.user.tag,
                iconURL: member.user.displayAvatarURL({ dynamic: true }),
              })
              .setDescription(
                lang.log_guild_member_add
                  .replace("{u}", `<@${member.id}>`)
                  .replace("{s}", `\`${member.guild.name}\``),
              )
              .addFields(
                {
                  name: lang.account_created,
                  value: `\`${moment(member.user.createdAt).format(
                    lang.time_format,
                  )}\` \n **${moment(member.user.createdAt).fromNow()}**`,
                  inline: true,
                },
                {
                  name: lang.inviter,
                  value: /^\d+$/.test(inviter) ? `${inviter}\n<@${inviter}>` : inviter,
                  inline: true,
                },
              )
              .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
              .setTimestamp()
              .setFooter({
                text: member.guild.name,
                iconURL: member.guild.iconURL(),
              }),
          ],
        });
        moment.locale("en");
      }
    });

    let whitelist = [];
    this.wordFilter = content_filter.preprocessWordLists(badwords, whitelist, {
      /*considerPrecedingApostrophes: false,
      considerFollowUpApostrophes: false,*/
      checkCircumventions: true,
    });
    this.strongword_filter = content_filter.preprocessWordLists(strong_words, whitelist, {
      /*considerPrecedingApostrophes: false,
            considerFollowUpApostrophes: false,*/
      checkCircumventions: true,
    });
    this.NSFW_api_changer = 0;
    this.logo_api_changer = 0;

    this.antiSpam = new AntiSpam({
      maxDuplicatesInterval: 10_000,
      unMuteTime: 60, // Time in minutes before the user will be able to send messages again.
      removeBotMessages: true,
      removeMessages: true, // Whether or not to remove all messages sent by the user.
      ignoredPermissions: [
        PermissionsBitField.Flags.Administrator,
      ], // If the user has the following permissions, ignore him.
      // For more options, see the documentation:
    });

    this.giveawaysManager = new GiveawaysManager(client, {
      storage: "./info/giveaways.json",
      default: {
        botsCanWin: false,
        embedColor: "#FF0000",
        embedColorEnd: "#000000",
        reaction: "🎉",
      },
    });
    this.twitch_api = new TwitchApi({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
    });
    this.moviedb = new MovieDb(process.env.MOVIEDB_API_KEY);

    this.manager = new LavalinkManager({
      nodes: this.config.nodes,
      sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard?.send(payload),
      autoSkip: true,
      clientName: `DiscordMusic/v${require("../package.json").version} (Bot: ${
        this.config.clientId
      })`,
      client: {
        id: this.config.clientId,
      },
      playerOptions: {
        clientBasedPositionUpdateInterval: 50, // in ms to up-calc player.position
        onDisconnect: {
          autoReconnect: false, // automatically attempts a reconnect, if the bot disconnects from the voice channel, if it fails, it get's destroyed
          destroyPlayer: true, // overrides autoReconnect and directly destroys the player if the bot disconnects from the vc
        },
        /*onEmptyQueue: {
          destroyAfterMs: 35_000, // 0 === instantly destroy | don't provide the option, to don't destroy the player
          // autoPlayFunction: afterque,
        },*/
        useUnresolvedData: true,
      },
      queueOptions: {
        maxPreviousTracks: 10,
      },
      /* debugOptions: {
        noAudio: false,
        playerDestroy: {
          dontThrowError: false,
          debugLog: true,
        },
      },*/
    });

    this.manager
      .on("SegmentsLoaded", (player, queue, payload) => {
        this.log(
          `${colors.blue(client.guilds.cache.get(player.options.guildId).name)}(${
            player.options.guildId
          }) | Segments has been loaded for a Youtube video.`,
        );
      })
      .on("SegmentSkipped", (player, queue, payload) => {
        this.log(
          `${colors.blue(client.guilds.cache.get(player.options.guildId).name)}(${
            player.options.guildId
          }) | A ${payload.segment.category} segment has been skipped in a Youtube video. ${prettyMilliseconds(
            payload.segment.start,
          )}->${prettyMilliseconds(payload.segment.end)}`,
        );
      })
      .on("nodeConnect", (node) =>
        this.warn(
          `${colors.blue(client.guilds.cache.get(player.options.guildId).name)}(${
            player.options.guildId
          }) | Lavalink node is connected.`,
        ),
      )
      .on("nodeReconnect", (node) =>
        this.warn(
          `${colors.blue(client.guilds.cache.get(player.options.guildId).name)}(${
            player.options.guildId
          }) | Lavalink node is reconnecting.`,
        ),
      )
      .on("nodeDestroy", (node) =>
        this.warn(
          `${colors.blue(client.guilds.cache.get(player.options.guildId).name)}(${
            player.options.guildId
          }) | Lavalink node is destroyed.`,
        ),
      )
      .on("nodeDisconnect", (node) =>
        this.warn(
          `${colors.blue(client.guilds.cache.get(player.options.guildId).name)}(${
            player.options.guildId
          }) | Lavalink node is disconnected.`,
        ),
      )
      .on("nodeError", (node, err) => {
        this.warn(
          `${colors.blue(client.guilds.cache.get(player.options.guildId).name)}(${
            player.options.guildId
          }) | Lavalink node has an error: ${err.message}.`,
        );
      })
      // on track error warn and create embed
      .on("trackError", async (player, track, payload) => {
        this.warn(
          `${colors.blue(client.guilds.cache.get(player.options.guildId).name)}(${
            player.options.guildId
          }) | Track had an error: ${payload.exception.message}.`,
        );
        const guildSettings = client.guild_settings.find((e) => e.guildId === player.guildId);
        const lang = client.localization_manager.getLanguage(
          await guildSettings.settings_db.getData("/language"),
        );
        var title = escapeMarkdown(track.info.title);
        var title = title.replace(/\]/g, "");
        var title = title.replace(/\[/g, "");

        let errorEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle(lang.playback_error)
          .setDescription(`${lang.failed_to_load} \`${title}\``)
          .setFooter({
            text: lang.something_went_wrong,
          });
        client.channels.cache
          .get(player.textChannelId)
          .send({
            embeds: [
              errorEmbed,
            ],
          })
          .then((msg) => {
            setTimeout(() => msg.delete(), 60000);
          });
      })

      .on("trackStuck", (player, track, payload) => {
        this.warn(`Track has an error: ${payload.exception.message}`);

        const guildSettings = client.guild_settings.find((e) => e.guildId === player.guildId);
        const lang = client.localization_manager.getLanguage(
          guildSettings.settings_db.getData("/language"),
        );

        var title = escapeMarkdown(track.info.title);
        var title = title.replace(/\]/g, "");
        var title = title.replace(/\[/g, "");

        let errorEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle(lang.track_error)
          .setDescription(`${lang.failed_to_load} \`${title}\``)
          .setFooter({
            text: lang.something_went_wrong,
          });
        this.channels.cache
          .get(player.textChannelId)
          .send({
            embeds: [
              errorEmbed,
            ],
          })
          .then((msg) => {
            setTimeout(() => msg.delete(), 60000);
          });
      })
      .on("playerMove", async (player, oldChannel, newChannel) => {
        const guild = client.guilds.cache.get(player.guild);
        if (!guild) {
          return;
        }
        const channel = guild.channels.cache.get(player.textChannelId);
        if (oldChannel === newChannel) {
          return;
        }
        if (newChannel === null || !newChannel) {
          if (!player) {
            return;
          }

          const guildSettings = client.guild_settings.find((e) => e.guildId === player.guildId);
          const lang = client.localization_manager.getLanguage(
            await guildSettings.settings_db.getData("/language"),
          );

          if (channel) {
            channel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.config.embedColor)
                  .setDescription(`${lang.disconnected_from} <#${oldChannel}>`),
              ],
            });
          }
          return player.destroy();
        } else {
          player.textChannelId = newChannel.id;
          setTimeout(() => player.pause(false), 1000);
          return undefined;
        }
      })
      .on("trackEnd", async (player, track, payload) => {
        /*console.log("trackend");
            if (player.queue.tracks.length > 0) {
              await player.setNowplayingMessage(null);
            }*/
        /*player.previousTracks.push(track);
            player.previousTracks = player.previousTracks.slice(-11);*/
      })
      .on("playerCreate", (player) => {
        //player.previousTracks = [];
        player.set("twentyFourSeven", client.config.twentyFourSeven);
        player.set("autoQueue", client.config.autoQueue);
        player.set("autoPause", client.config.autoPause);
        player.set("autoLeave", client.config.autoLeave);
        this.log(
          `${colors.blue(client.guilds.cache.get(player.options.guildId).name)}(${
            player.options.guildId
          }) | The bot joined channel(${player.voiceChannelId}) to play.`,
        );
      })
      .on("playerDestroy", async (player, reason) => {
        this.log(
          `${colors.blue(client.guilds.cache.get(player.options.guildId).name)}(${
            player.options.guildId
          }) | The bot left the channel after playing.`,
        );
        await player.setNowplayingMessage(client, null);
      })
      // on LOAD_FAILED send error message
      .on("loadFailed", (node, type, error) =>
        this.warn(`Node: ${node.options.identifier} | Failed to load ${type}: ${error.message}`),
      )
      // on TRACK_START send message
      .on("trackStart", async (player, track, payload) => {
        if (!track || !track.info) {
          await player.stopPlaying(true);
          return;
        }
        this.songsPlayed++;

        const guildSettings = client.guild_settings.find((e) => e.guildId === player.guildId);
        const lang = client.localization_manager.getLanguage(
          await guildSettings.settings_db.getData("/language"),
        );
        this.log(
          `${colors.blue(client.guilds.cache.get(player.options.guildId).name)}(${
            player.options.guildId
          }) | Track started [${colors.blue(track.info.title)}] ${track.info.uri}`,
        );
        var title = escapeMarkdown(track.info.title);
        var title = title.replace(/\]/g, "");
        var title = title.replace(/\[/g, "");
        let trackStartedEmbed = this.Embed()
          .setAuthor({ name: lang.now_playing, iconURL: this.config.iconURL })
          .setDescription(
            track.info.uri && title ? `[${title}](${track.info.uri})` : lang.no_descriptions,
          )
          .addFields(
            {
              name: lang.requested_by,
              value: `${track.requester || `<@${client.user.id}>`}`,
              inline: true,
            },
            {
              name: lang.uploader,
              value: track.info.author,
              inline: true,
            },
            {
              name: lang.duration,
              value: track.info.isStream
                ? lang.LIVE
                : `\`${prettyMilliseconds(track.info.duration, {
                    colonNotation: true,
                  })}\``,
              inline: true,
            },
          );
        trackStartedEmbed.setThumbnail(track.info.artworkUrl);
        let nowPlaying = await client.channels.cache
          .get(player.textChannelId)
          .send({
            embeds: [
              trackStartedEmbed,
            ],
            components: [
              client.createController(player.guildId, player),
            ],
          })
          .catch(async (error) => {
            console.error(error);
            await player.stopPlaying(true);
            return;
          });
        await player.setNowplayingMessage(client, nowPlaying);
      })

      .on(
        "playerDisconnect",
        /** @param {EpicPlayer} */ async (player) => {
          if (player.twentyFourSeven) {
            player.queue.clear();
            player.stop();
            player.set("autoQueue", false);
          } else {
            player.destroy();
          }
        },
      )

      .on(
        "queueEnd",
        /** @param {EpicPlayer} */ async (player, track) => {
          const guildSettings = client.guild_settings.find((e) => e.guildId === player.guildId);
          const lang = client.localization_manager.getLanguage(
            await guildSettings.settings_db.getData("/language"),
          );
          const autoQueue = player.get("autoQueue");

          if (autoQueue) {
            const search = `https://www.youtube.com/watch?v=${track.info.identifier}&list=RD${track.info.identifier}`;
            const res = await player.search(search, client.user);
            let nextTrackIndex;
            res.tracks.some((track, index) => {
              nextTrackIndex = index;
              for (let a = 0; a < player.queue.previous.length; a++) {
                if (player.queue.previous[a].info.identifier === track.info.identifier) {
                  return false;
                }
              }
              return true;
            });

            if (res.exception) {
              client.channels.cache
                .get(player.textChannelId)
                .send({
                  embeds: [
                    new EmbedBuilder()
                      .setColor("#FF0000")
                      .setAuthor({
                        name: `${lang.playback_error}(${res.exception.severity})`,
                        iconURL: client.config.iconURL,
                      })
                      .setDescription(`${lang.could_not_load_track} ${res.exception.message}`),
                  ],
                })
                .then((msg) => {
                  setTimeout(() => msg.delete(), 30000);
                });
              return player.destroy();
            }
            if (nextTrackIndex) {
              player.queue.add(res.tracks[nextTrackIndex]);
              player.play();
            }
            /* player.play(res.tracks[nextTrackIndex]);
                            player.queue.previous = track;*/
          } else {
            const twentyFourSeven = player.get("twentyFourSeven");

            let queueEmbed = new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setAuthor({
                name: lang.queue_ended,
                iconURL: client.config.iconURL,
              })
              .setFooter({ text: lang.footer_que_ended })
              .setTimestamp();
            let EndQueue = await client.channels.cache.get(player.textChannelId).send({
              embeds: [
                queueEmbed,
              ],
            });
            setTimeout(() => EndQueue.delete(true), 5000);
            try {
              if (!player.playing && !twentyFourSeven) {
                setTimeout(async () => {
                  if (!player.playing && player.state !== "DISCONNECTED") {
                    await client.channels.cache
                      .get(player.textChannelId)
                      .send({
                        embeds: [
                          new EmbedBuilder()
                            .setColor(client.config.embedColor)
                            .setAuthor({
                              name: lang.disconnected,
                              iconURL: client.config.iconURL,
                            })
                            .setDescription(lang.disc_due_to_inac),
                        ],
                      })
                      .then((msg) => {
                        setTimeout(() => msg.delete(), 6000);
                      });
                    await player.destroy();
                  } else if (player.playing) {
                    client.warn(
                      `${colors.blue(client.guilds.cache.get(player.options.guildId).name)}(${
                        player.options.guildId
                      }) | Still playing`,
                    );
                  }
                }, client.config.disconnectTime);
              } else if (!player.playing && twentyFourSeven) {
                client.warn(
                  `${colors.blue(client.guilds.cache.get(player.options.guildId).name)}(${
                    player.options.guildId
                  }) | Queue has ended [${colors.blue("24/7 ENABLED")}]`,
                );
              } else {
                client.warn(`Something unexpected happened with player ${player.options.guildId}`);
                client.channels.cache
                  .get(player.textChannelId)
                  .send({
                    embeds: [
                      client.ErrorEmbed(lang.error_title, lang.unexpected_happen),
                    ],
                  })
                  .then((msg) => {
                    setTimeout(() => msg.delete(), 15000);
                  });
              }
              await player.setNowplayingMessage(client, null);
            } catch (err) {
              client.error(err);
            }
          }
        },
      );
    await this.login(process.env.TOKEN);
  }
  /**
   * Checks if a message has been deleted during the run time of the Bot
   * @param {Message} message
   * @returns
   */
  isMessageDeleted(message) {
    return this.deletedMessages.has(message);
  }

  /**
   * Marks (adds) a message on the client's `deletedMessages` WeakSet so it's
   * state can be seen through the code
   * @param {Message} message
   */
  markMessageAsDeleted(message) {
    this.deletedMessages.add(message);
  }
  /**
   *
   * @param {string} text
   * @returns {EmbedBuilder}
   */
  Embed(text) {
    let embed = new EmbedBuilder().setColor(this.config.embedColor);

    if (text) {
      embed.setDescription(text);
    }

    return embed;
  }

  /**
   *
   * @param {string} title
   * @param {string} text
   * @returns {EmbedBuilder}
   */
  ErrorEmbed(title, text) {
    return new EmbedBuilder().setColor("#FF0000").setDescription(text).setAuthor({
      name: title,
      iconURL: this.config.error_gif_URL,
    });
  }
  WarningEmbed(title, text) {
    return new EmbedBuilder().setColor("#FFFF00").setDescription(text).setAuthor({
      name: title,
      iconURL: this.config.warning_gif_URL,
    });
  }

  SuccessEmbed(text) {
    return new EmbedBuilder().setColor("#228B22").setDescription("✅ | " + text);
  }
  async ServiceChannels() {
    let EventsDir = path.join(__dirname, "..", "db");
    fs.readdir(EventsDir, async (err, files) => {
      if (err) {
        throw err;
      } else {
        for (const file of files) {
          const guild = await this.guilds.fetch(path.parse(file).name);
          const settings_db = new JsonDB(new Config(EventsDir + "/" + file, true, true, "/"));
          let temp_guild_settings = {
            guildId: guild.id,
            settings_db: settings_db,
          };

          if (await settings_db.exists("/counter_channel")) {
            await this.setup_counter_channel(guild);
          }
          if (await settings_db.exists("/gamestat_channel")) {
            await this.setup_gamestat_channel(guild);
          }
          if (await settings_db.exists("/openspy_channel")) {
            await this.setup_openspy_channel(guild);
          }
          if (await settings_db.exists("/nameday_channel")) {
            const temp = await settings_db.getData("/nameday_channel");
            this.nameday_channels.push(temp.nameday_channel_id);
          }
          if (await settings_db.exists("/word_game")) {
            this.wordgame_status.push(
              decode(fs.readFileSync(`./info/wordgame/${guild.id}_wordgame.json`)),
            );
          }
          if (await settings_db.exists("/countdown_channel")) {
            await this.setup_countdown_channel(guild);
          }
          this.guild_settings.push(temp_guild_settings);
          if (await settings_db.exists("/temp_channel")) {
            const tempChannel_temp = await settings_db.getData("/temp_channel");
            this.setup_tempchannel(tempChannel_temp, guild);
          }
          if (await settings_db.exists("/rss")) {
            const rss_temp = await settings_db.getData("/rss");
            for (let i = 0; i < rss_temp.length; i++) {
              this.feed_list.push({
                guild_id: guild.id,
                url: rss_temp[i].url,
                channel_id: rss_temp[i].channel_id,
                last_date: Date.now(),
                last_titles: [],
                post_number: 0,
              });
            }
          }
          if (await settings_db.exists("/twitch")) {
            const twitch_temp = await settings_db.getData("/twitch");
            for (let i = 0; i < twitch_temp.length; i++) {
              this.twitch_list.push({
                guild_id: guild.id,
                twitch_user: twitch_temp[i].twitch_user,
                channel_id: twitch_temp[i].channel_id,
                last_status: "",
                mention: twitch_temp[i].mention,
              });
            }
          }
          if (await settings_db.exists("/youtube")) {
            const youtube_temp = await settings_db.getData("/youtube");
            for (let i = 0; i < youtube_temp.length; i++) {
              this.youtube_list.push({
                guild_id: guild.id,
                channel_id: youtube_temp[i].channel_id,
                mention: youtube_temp[i].mention,
                youtube_channel_id: youtube_temp[i].youtube_channel_id,
                youtube_user: youtube_temp[i].youtube_user,
                last_posted_date: Date.now(),
                last_video_ids: [],
              });
            }
          }
        }
      }
    });

    schedule.scheduleJob("send_namedays", "0 3 * * *", async () => {
      this.antiSpam.reset();
      this.feed_list.forEach((feed) => (feed.post_number = 0));

      const namedayChannels = this.nameday_channels.map((channelId) =>
        this.channels.cache.get(channelId),
      );
      const messageText1 = "Mai napon a névnapját ünnepli: ";
      const messageText2 = "További névnapok: ";

      let names1 = [],
        names2 = [],
        apiError = false;

      try {
        const response = await fetch("https://nevnap.xsak.hu/json.php");
        if (!response?.ok) throw new Error("Astronomy API error");
        const data = await response.json();
        names1 = data.nev1 || [];
        names2 = data.nev2 || [];
      } catch (error) {
        apiError = true;
      }

      if (!apiError) {
        const message1 = messageText1 + names1.map((name) => `**${name}**`).join(", ");
        const message2 = messageText2 + names2.map((name) => `**${name}**`).join(", ");

        namedayChannels.forEach((channel) => {
          if (channel) {
            this.postThrottle.add(() => {
              return channel.send(`${message1}\n${message2}`).catch((e) => {
                this.error(`Failed to send the nameday message to ${channel.guild.id}`);
              });
            });
          }
        });
      } else {
        let fallbackMessage = "Mai napon a névnapját ünnepli: ";
        try {
          const response = await fetch("https://api.nevnapok.eu/ma");
          if (!response?.ok) throw new Error("Astronomy API error");
          const data = await response.json();
          fallbackMessage += `**${Object.values(data).join("**, **")}**`;
        } catch (error) {
          fallbackMessage += "**API hibát észlelt**";
        }

        namedayChannels.forEach((channel) => {
          if (channel) {
            this.postThrottle.add(() => {
              return channel.send(fallbackMessage).catch((e) => {
                this.error(`Failed to send the nameday message to ${channel.guild.id}`);
              });
            });
          }
        });
      }
    });
    if (fs.existsSync(`./info/word_db.txt`)) {
      const file = await open(`./info/word_db.txt`);
      for await (const line of file.readLines()) {
        if (line !== "") {
          this.wordgame_cache.push(line);
        }
      }
      this.last_cache_size = this.wordgame_cache.length;
    }
    schedule.scheduleJob(`update_word_cache`, "10 */5 * * * *", async () => {
      if (this.last_cache_size !== this.wordgame_cache.length) {
        for (let i = this.last_cache_size; i < this.wordgame_cache.length; i++) {
          this.worddb_writer.write(this.wordgame_cache[i] + "\n");
        }
        this.last_cache_size = this.wordgame_cache.length;
      }
    });
    this.url_shorteners = this.listLinkShorterners();
  }

  /**
   *
   * @param {import("discord.js").TextChannel} textChannel
   * @param {import("discord.js").VoiceChannel} voiceChannel
   */
  createPlayer(textChannel, voiceChannel) {
    let new_player = this.manager.createPlayer({
      twentyFourSeven: false,
      guildId: textChannel.guild.id,
      voiceChannelId: voiceChannel.id,
      textChannelId: textChannel.id,
      selfDeafen: this.config.serverDeafen,
      volume: this.config.defaultVolume,
    });
    new_player.setNowplayingMessage = async function (client, message) {
      if (this.nowPlayingMessage && !client.isMessageDeleted(this.nowPlayingMessage)) {
        this.nowPlayingMessage.delete();
        client.markMessageAsDeleted(this.nowPlayingMessage);
      }
      return (this.nowPlayingMessage = message);
    };
    return new_player;
  }

  createController(guild, player) {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`controller:${guild}:Stop`)
        .setEmoji("⏹️"),

      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`controller:${guild}:Replay`)
        .setEmoji("⏮️"),

      new ButtonBuilder()
        .setStyle(!player.paused ? ButtonStyle.Primary : ButtonStyle.Danger)
        .setCustomId(`controller:${guild}:PlayAndPause`)
        .setEmoji(!player.paused ? "⏸️" : "▶️"),

      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`controller:${guild}:Next`)
        .setEmoji("⏭️"),

      new ButtonBuilder()
        .setStyle(
          player.repeatMode === "track"
            ? ButtonStyle.Success
            : player.repeatMode === "queue"
              ? ButtonStyle.Success
              : ButtonStyle.Danger,
        )
        .setCustomId(`controller:${guild}:Loop`)
        .setEmoji(
          player.repeatMode === "track" ? "🔂" : player.repeatMode === "queue" ? "🔁" : "🔁",
        ),
    );
  }
  async setupWordgame(guild, lang, game_channel) {
    try {
      await game_channel.setRateLimitPerUser(5, "Wordgame enabled");
      return game_channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#000000")
            .setTitle(lang.wordgame_title)
            .setDescription(lang.wordgame_description)
            .addFields(
              { name: lang.total_correct_word, value: "0", inline: true },
              { name: lang.current_chain, value: "0", inline: true },
              { name: lang.last_correct_word, value: "-", inline: true },
              { name: lang.longest_word, value: "-", inline: true },
              { name: lang.longest_word_author, value: "-", inline: true },
            )
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL() }),
        ],
      });
    } catch (r) {
      console.log(r);
    }
  }
  setup_counter_channel(guild) {
    schedule.scheduleJob(
      `${guild.id}_counter`,
      `${this.randomIntFromInterval(1, 55)} */${this.randomIntFromInterval(6, 7)} * * * *`,
      async () => {
        let guildSettings = this.guild_settings.find((e) => e.guildId === guild.id);
        const members = await guild.members.fetch();
        const onlineMembers = members.filter(
          (member) =>
            [
              "online", "idle", "dnd",
            ].includes(member.presence?.status) && !member.user.bot,
        ).size;
        if (
          onlineMembers !==
          +guildSettings.settings_db.data.counter_channel.counter_channel_prev_value
        ) {
          guildSettings.settings_db.data.counter_channel.counter_channel_prev_value = onlineMembers;
          await guild.channels.cache
            .get(guildSettings.settings_db.data.counter_channel.counter_channel_id)
            .setName(
              guildSettings.settings_db.data.counter_channel.counter_channel_scheme.replace(
                "{i}",
                onlineMembers.toString(),
              ),
            );
        }
      },
    );
  }
  setup_gamestat_channel(guild) {
    schedule.scheduleJob(
      `${guild.id}_gamestat`,
      `${this.randomIntFromInterval(1, 55)} */${this.randomIntFromInterval(6, 7)} * * * *`,
      async () => {
        let guildSettings = this.guild_settings.find((e) => e.guildId === guild.id);
        const targetGame = guildSettings.settings_db.data.gamestat_channel.gamestat_channel_game
          .toLowerCase()
          .trim();

        let playing_users = 0;

        const fetchedMembers = await guild.members.fetch();

        fetchedMembers.forEach((element) => {
          if (element.presence && !element.user.bot) {
            for (const activity of element.presence.activities) {
              if (activity.name.toLowerCase().trim() === targetGame) {
                playing_users++;
                break; // No need to continue checking other activities
              }
            }
          }
        });

        if (
          playing_users !==
          +guildSettings.settings_db.data.gamestat_channel.gamestat_channel_prev_value
        ) {
          guildSettings.settings_db.data.gamestat_channel.gamestat_channel_prev_value =
            playing_users;
          await guild.channels.cache
            .get(guildSettings.settings_db.data.gamestat_channel.gamestat_channel_id)
            .setName(
              guildSettings.settings_db.data.gamestat_channel.gamestat_channel_scheme.replace(
                "{i}",
                playing_users.toString(),
              ),
            );
        }
      },
    );
  }
  setup_countdown_channel(guild) {
    schedule.scheduleJob(
      `${guild.id}_countdown`,
      `${this.randomIntFromInterval(1, 55)} */${this.randomIntFromInterval(6, 7)} * * * *`,
      async () => {
        let guildSettings = this.guild_settings.find((e) => e.guildId === guild.id);
        const lang = this.localization_manager.getLanguage(guildSettings.settings_db.data.language);
        const target_datetime = moment(
          `${guildSettings.settings_db.data.countdown_channel.countdown_channel_date} ${guildSettings.settings_db.data.countdown_channel.countdown_channel_time}`,
          "YYYY.MM.DD H:m",
        );
        const difference = moment.duration(target_datetime.diff(moment()));
        let timer_data;

        if (moment(target_datetime).isAfter(moment(), "minute")) {
          if (difference.asMinutes() >= 1440) {
            timer_data = difference.format(`d[${lang.short_days}] H[${lang.short_hours}]`);
            timer_data =
              guildSettings.settings_db.data.countdown_channel.countdown_channel_scheme.replace(
                "{i}",
                timer_data,
              );
          } else if (difference.asMinutes() >= 60) {
            timer_data = difference.format(`H[${lang.short_hours}] m[${lang.short_minutes}]`);
            timer_data =
              guildSettings.settings_db.data.countdown_channel.countdown_channel_scheme.replace(
                "{i}",
                timer_data,
              );
          } else {
            timer_data = difference.format(`m[${lang.short_minutes}]`);
            timer_data =
              guildSettings.settings_db.data.countdown_channel.countdown_channel_scheme.replace(
                "{i}",
                timer_data,
              );
          }
        } else {
          await guild.channels.cache
            .get(guildSettings.settings_db.data.countdown_channel.countdown_channel_id)
            .setName(guildSettings.settings_db.data.countdown_channel.countdown_channel_end_text);
          await guildSettings.settings_db.delete("/countdown_channel");
          let current_job = schedule.scheduledJobs[`${guild.id}_countdown`];
          if (current_job) {
            current_job.cancel();
          }
          return;
        }
        if (
          timer_data !==
          guildSettings.settings_db.data.countdown_channel.countdown_channel_prev_value
        ) {
          guildSettings.settings_db.data.countdown_channel.countdown_channel_prev_value =
            timer_data;
          await guild.channels.cache
            .get(guildSettings.settings_db.data.countdown_channel.countdown_channel_id)
            .setName(timer_data);
        }
      },
    );
  }

  setup_openspy_channel(guild) {
    const jobName = `${guild.id}_openspy`;
    schedule.scheduleJob(jobName, `${this.randomIntFromInterval(20, 55)} */5 * * * *`, async () => {
      const guildSettings = this.guild_settings.find((e) => e.guildId === guild.id);
      const channelId = guildSettings.settings_db.data.openspy_channel.openspy_channel_id;
      const scheme = guildSettings.settings_db.data.openspy_channel.openspy_channel_scheme;
      const targetGame = guildSettings.settings_db.data.openspy_channel.openspy_channel_game
        .toLowerCase()
        .trim();
      // Fetch player data
      let totalPlayers = 0;
      let activeServers = 0;
      try {
        const apiUrl = `https://openspy-website.nyc3.digitaloceanspaces.com/servers/${targetGame}.json`;
        const response = await fetch(apiUrl, {
          headers: { Accept: "application/json", "User-Agent": "DiscordBot/1.0" },
        });
        if (response.ok) {
          const servers = await response.json();
          if (Array.isArray(servers)) {
            totalPlayers = servers.reduce((sum, srv) => sum + (srv.numplayers || 0), 0);
            activeServers = servers.filter((srv) => srv.numplayers > 0).length;
          }
        } else {
          throw new Error(`API responded with ${response.status}`);
        }
      } catch (error) {
        console.error("Player count error:", error);
      }

      // Try to get and rename the channel
      const channel = guild.channels.cache.get(channelId);
      if (!channel) {
        console.warn(`Channel ${channelId} not found, cancelling job ${jobName}`);
        await guildSettings.delete("/openspy_channel");
        return schedule.cancelJob(jobName);
      }

      // Update name safely
      channel.setName(scheme.replace("{n}", totalPlayers)).catch(console.error);
    });
  }

  async setup_tempchannel(tempChannel_temp, guild) {
    const guildSettings = this.guild_settings.find((e) => e.guildId === guild.id);
    const lang = this.localization_manager.getLanguage(
      await guildSettings.settings_db.getData("/language"),
    );
    if (tempChannel_temp.temp_channel_scheme === "Number") {
      this.tempChannelsmanager.registerChannel(tempChannel_temp.temp_channel_id, {
        childCategory: tempChannel_temp.temp_channel_parentId,
        childAutoDeleteIfEmpty: true,
        childAutoDeleteIfParentGetsUnregistered: true,
        childAutoDeleteIfOwnerLeaves: false,
        childVoiceFormat: (str, count) =>
          `${count}${lang.temp_channel_numbered}` /*childVoiceFormatRegex: /^[1-9][0-9]?/,*/,
        childVoiceFormatRegex: new RegExp("/^[1-9][0-9]?" + lang.temp_channel_numbered + "/"),
        childMaxUsers: 25,
        childBitrate: 96000,
        childShouldBeACopyOfParent: false,
      });
    }
    if (tempChannel_temp.temp_channel_scheme === "Name") {
      this.tempChannelsmanager.registerChannel(tempChannel_temp.temp_channel_id, {
        childCategory: tempChannel_temp.temp_channel_parentId,
        childAutoDeleteIfEmpty: true,
        childAutoDeleteIfParentGetsUnregistered: true,
        childAutoDeleteIfOwnerLeaves: false,
        childVoiceFormat: (str, count) => `${str}${lang.temp_channel_usernane}`,
        childVoiceFormatRegex: new RegExp(
          "/^.*" + lang.temp_user_nane + "/",
        ) /* childVoiceFormatRegex: /^.* szobája/,*/,
        childMaxUsers: 25,
        childBitrate: 96000,
        childShouldBeACopyOfParent: false,
      });
    }
  }
  async poll_add_vote(reaction, user) {
    if (reaction.partial) reaction = await reaction.fetch();
    if (!reaction.message.guild) return;
    if (user.partial) user = await user.fetch();
    if (!reaction.message.guild.members.cache.has(user.id)) return;
    const poll_settings_pos = this.polls.map((e) => e.messageId).indexOf(reaction.message.id);

    if (poll_settings_pos !== -1) {
      let pool_settings = await this.polls[poll_settings_pos].poll_data.getData("/");
      if (reaction.emoji.name === pool_settings.forceEndPollEmoji) {
        if (
          (await this.polls[poll_settings_pos].poll_data.getData("/starter")) === user.id ||
          reaction.message.guild.members.cache
            .find((member) => member.id === user.id)
            .permissions.has(PermissionsBitField.Flags.Administrator)
        ) {
          await this.end_pool(
            await this.polls[poll_settings_pos].poll_data.getData("/channelId"),
            await this.polls[poll_settings_pos].poll_data.getData("/messageId"),
          );
        }
        return;
      }
      if (Object.keys(pool_settings.emojis).includes(reaction.emoji.name)) {
        pool_settings.emojis[reaction.emoji.name].votes++;
        if (!Object.keys(pool_settings.voters).includes(user.id)) {
          pool_settings.voters[user.id] = { userId: user.id, vote_number: 1 };
        } else {
          pool_settings.voters[user.id].vote_number++;
        }
        if (pool_settings.voters[user.id].vote_number > pool_settings.limit) {
          await reaction.users.remove(user.id);
        }
        this.polls[poll_settings_pos].changed = true;
        await this.polls[poll_settings_pos].poll_data.push("/", pool_settings);
      }
    }
  }
  async poll_remove_vote(reaction, user) {
    if (reaction.partial) reaction = await reaction.fetch();
    if (!reaction.message.guild) return;
    if (user.partial) user = await user.fetch();
    if (!reaction.message.guild.members.cache.has(user.id)) return;
    const poll_settings_pos = this.polls.map((e) => e.messageId).indexOf(reaction.message.id);
    if (poll_settings_pos !== -1) {
      let pool_settings = await this.polls[poll_settings_pos].poll_data.getData("/");
      if (Object.keys(pool_settings.emojis).includes(reaction.emoji.name)) {
        pool_settings.emojis[reaction.emoji.name].votes--;
        if (Object.keys(pool_settings.voters).includes(user.id)) {
          pool_settings.voters[user.id].vote_number--;
        }
        if (pool_settings.voters[user.id].vote_number === 0) {
          delete pool_settings.voters[user.id];
        }
        this.polls[poll_settings_pos].changed = true;
        await this.polls[poll_settings_pos].poll_data.push("/", pool_settings);
      }
    }
  }
  async is_it_word_game_channel(channel, guildSettings) {
    try {
      const temp = await guildSettings.settings_db.getData("/word_game");
      return temp.word_game_channel_id === channel.id;
    } catch (e) {
      return false;
    }
  }
  async is_it_game_channel(channel, guildSettings) {
    try {
      const temp = await guildSettings.settings_db.getData("/game_channel");
      return temp.game_channel_id === channel.id;
    } catch (e) {
      return true;
    }
  }
  async is_it_media_channel(channel, guildSettings) {
    try {
      const temp = await guildSettings.settings_db.getData("/media_channel");
      return temp.media_channel_id === channel.id;
    } catch (e) {
      return true;
    }
  }
  async load_polls() {
    let EventsDir = path.join(__dirname, "..", "info/poll");
    fs.readdir(EventsDir, async (err, files) => {
      if (err) {
        throw err;
      } else {
        for (const file of files) {
          const poll_db = new JsonDB(new Config(EventsDir + "/" + file, false, true, "/"));
          const temp = file.split("_");
          let temp_poll_settings = {
            messageId: temp[0],
            changed: false,
            poll_data: poll_db,
          };
          const channelId = await poll_db.getData("/channelId");
          const messageId = temp[0];
          const endTime = await poll_db.getData("/endTime");

          if (
            (await this.checkIfMessageExists(channelId, messageId)) &&
            moment(moment(endTime, "YYYY M D H m")).isAfter(moment(), "minute")
          ) {
            this.polls.push(temp_poll_settings);
            this.start_poll_timer(channelId, messageId, endTime);
          } else {
            this.error(`The ${temp[0]} poll isn't valid. Data deleted.`);
            if (fs.existsSync(`./info/poll/${temp[0]}_poll.json`)) {
              fs.unlinkSync(`./info/poll/${temp[0]}_poll.json`);
            }
          }
        }
      }
    });
    schedule.scheduleJob(`update_poll_data`, "20 */2 * * * *", async () => {
      for (let i = 0; i < this.polls.length; i++) {
        try {
          if (this.polls[i].changed) {
            this.polls[i].changed = false;
            await this.polls[i].poll_data.save();
          }
        } catch (e) {}
      }
    });
  }
  checkIfMessageExists = async (channelId, messageId) => {
    try {
      let channel = this.channels.cache.get(channelId);
      const message = await channel.messages.fetch(messageId).catch(() => undefined);
      if (message) return true;
    } catch (error) {}
    return false;
  };
  start_poll_timer(channelId, messageId, endTime) {
    const timer = endTime.split(" ");
    schedule.scheduleJob(
      `${messageId}_poll_timer`,
      `${timer[4]} ${timer[3]} ${timer[2]} ${timer[1]} *`,
      async () => {
        await this.end_pool(channelId, messageId);
      },
    );
  }
  async end_pool(channelId, messageId) {
    if (await this.checkIfMessageExists(channelId, messageId)) {
      let channel = this.channels.cache.get(channelId);
      const old_message = await channel.messages.fetch(messageId).catch(() => undefined);
      const poll_settings_pos = this.polls.findIndex((e) => e.messageId === old_message.id);
      let result = await this.polls[poll_settings_pos].poll_data.getData("/emojis");
      result = this.sort(result, (val) => val.votes);

      const guildSettings = this.guild_settings.find((e) => e.guildId === channel.guildId);
      const lang = this.localization_manager.getLanguage(
        await guildSettings.settings_db.getData("/language"),
      );

      let embed = new EmbedBuilder()
        .setTitle(
          `${lang.poll_title} ${await this.polls[poll_settings_pos].poll_data.getData("/title")}`,
        )
        .setColor(await this.polls[poll_settings_pos].poll_data.getData("/embedColor"))
        .setDescription(lang.pool_over_description);
      const values = Array.from(result.values());
      for (let i = 0; i < values.length; i++) {
        embed.addFields([
          {
            name: `${values[i].option} **${values[i].text}**`,
            value: `${values[i].votes.toString()} ${lang.pool_vote}`,
            inline: true,
          },
        ]);
      }
      if (await this.polls[poll_settings_pos].poll_data.exists("/image")) {
        embed.setThumbnail(await this.polls[poll_settings_pos].poll_data.getData("/image"));
      }
      await channel.send({
        embeds: [
          embed,
        ], //!
      });
      await old_message.delete();
      this.polls.splice(poll_settings_pos, 1);
      if (fs.existsSync(`./info/poll/${messageId}_poll.json`)) {
        fs.unlinkSync(`./info/poll/${messageId}_poll.json`);
      }
      let current_job = schedule.scheduledJobs[`${messageId}_poll_timer`];
      if (current_job) {
        current_job.cancel();
      }
    } else {
      this.error(`Message for ${messageId} poll doesn't exists. Data deleted.`);
      if (fs.existsSync(`./info/poll/${messageId}_poll.json`)) {
        fs.unlinkSync(`./info/poll/${messageId}_poll.json`);
      }
      let current_job = schedule.scheduledJobs[`${messageId}_poll_timer`];
      if (current_job) {
        current_job.cancel();
      }
    }
  }
  sort(obj, valSelector) {
    const sortedEntries = Object.entries(obj).sort((a, b) =>
      valSelector(a[1]) < valSelector(b[1]) ? 1 : valSelector(a[1]) > valSelector(b[1]) ? -1 : 0,
    );
    return new Map(sortedEntries);
  }
  is_it_shortened(message) {
    return this.url_shorteners.some((shortener) => message.toLowerCase().includes(shortener));
  }
  listLinkShorterners() {
    try {
      const linkShortenersFile = fs.readFileSync("./info/link-shorteners.txt", "utf-8");
      const linkShortenersSet = new Set(linkShortenersFile.split("\n").map((line) => line.trim()));
      let linkShortenersList = Array.from(linkShortenersSet);
      linkShortenersList = linkShortenersList.filter(function (item) {
        return !item.includes("#");
      });
      return linkShortenersList;
    } catch (error) {
      console.error("Error reading file", error.message);
      return null;
    }
  }
  setup_feeds() {
    schedule.scheduleJob(`feed_updater`, "30 */15 * * * *", async () => {
      let request_cache = {};
      let rss;
      for (let i = 0; i < this.feed_list.length; i++) {
        if (this.feed_list[i].post_number > 50) {
          continue;
        }
        let send_feed_here = this.channels.cache.get(this.feed_list[i].channel_id);
        if (!send_feed_here) {
          continue;
        }
        if (!request_cache[this.feed_list[i].url]) {
          try {
            let response = await this.fetchWithRetry(this.feed_list[i].url, {
              method: "GET",
              headers: {
                "Content-Type": "text/xml",
              },
            });
            rss = await this.parse_rss(await response.text());
          } catch (e) {
            /*this.error(
              `Failed to fetch ${this.feed_list[i].url} to post in ${this.feed_list[i].channel_id} channel.`,
            );*/
            continue;
          }
          request_cache[this.feed_list[i].url] = rss;
        } else {
          rss = request_cache[this.feed_list[i].url];
        }

        for (let a = 0; a < 4; a++) {
          if (
            rss &&
            rss.items &&
            rss.items[a] &&
            !this.feed_list[i].last_titles.includes(rss.items[a].title)
          ) {
            if (this.feed_list[i].last_titles.length === 4) {
              this.feed_list[i].post_number++;
              await this.postThrottle.add(() => {
                return send_feed_here.send(
                  `:newspaper: | **${rss.items[a].title}**\n\n${rss.items[a].link}`,
                );
              });
            }
            this.feed_list[i].last_date = rss.items[0].published;
            this.feed_list[i].last_titles.push(rss.items[0].title);
            if (this.feed_list[i].last_titles.length >= 5) {
              this.feed_list[i].last_titles.shift();
            }
          } else {
            break;
          }
        }
      }
    });
  }
  isUrl(s) {
    const regexp =
      /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);
  }
  randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  setup_twitch() {
    schedule.scheduleJob("twitch_updater", "40 */1 * * * *", async () => {
      // Use Set to store unique channel names
      const channels = [
        ...new Set(this.twitch_list.map((item) => item.twitch_user)),
      ];
      if (channels.length > 0) {
        try {
          const twitch_response = await this.twitch_api.getStreams({
            channels,
          });
          for (const item of this.twitch_list) {
            const send_feed_here = this.channels.cache.get(item.channel_id);
            if (!send_feed_here) continue;
            const stream = twitch_response.data.find(
              (data) => data.user_name.toLowerCase() === item.twitch_user.toLowerCase(),
            );
            if (stream) {
              if (item.last_status === "offline") {
                let message_text = "";
                const guildSettings = this.guild_settings.find(
                  (e) => e.guildId === send_feed_here.guild.id,
                );
                const lang = this.localization_manager.getLanguage(
                  await guildSettings.settings_db.getData("/language"),
                );
                if (
                  [
                    "@everyone", "@here",
                  ].includes(item.mention)
                ) {
                  message_text = item.mention;
                } else if (item.mention) {
                  message_text = `<@&${item.mention}>`;
                }
                message_text += ` ${lang.twitch_live_message.replace("{u}", stream.user_name)}`;
                const embed = new EmbedBuilder()
                  .setTitle(stream.title)
                  .setDescription(`:link: https://www.twitch.tv/${stream.user_name}`)
                  .setImage(stream.getThumbnailUrl())
                  .setFields(
                    {
                      name: lang.username_title,
                      value: stream.user_name,
                      inline: true,
                    },
                    {
                      name: lang.game_title,
                      value: stream.game_name,
                      inline: true,
                    },
                    {
                      name: lang.viewers_title,
                      value: stream.viewer_count.toString(),
                      inline: true,
                    },
                  )
                  .setTimestamp()
                  .setFooter({
                    text: send_feed_here.guild.name,
                    iconURL: send_feed_here.guild.iconURL(),
                  });
                await this.postThrottle.add(() => {
                  return send_feed_here.send({
                    content: message_text,
                    embeds: [
                      embed,
                    ],
                  });
                });
              }
              item.last_status = "live";
            } else {
              item.last_status = "offline";
            }
          }
        } catch (error) {}
      }
    });
  }
  setup_youtube() {
    schedule.scheduleJob(`youtube_updater`, "30 */20 * * * *", async () => {
      let youtube_data;
      for (let i = 0; i < this.youtube_list.length; i++) {
        let SwapDate = this.youtube_list[i].last_posted_date;
        let message_text = "";
        let send_feed_here = this.channels.cache.get(this.youtube_list[i].channel_id);
        if (!send_feed_here) {
          continue;
        }
        try {
          youtube_data = await YoutubeChecker.listYouTubeChannelVideos(
            this.youtube_list[i].youtube_channel_id,
          );
          if (youtube_data.length === 0) {
            continue;
          }
        } catch (e) {
          continue;
        }
        for (let a = 0; a < youtube_data.length; a++) {
          if (!youtube_data || !youtube_data[a]) {
            break;
          }
          let TimeToCheck;
          if (
            youtube_data[a].liveBroadcastContent === "upcoming" &&
            youtube_data[a].liveDetails &&
            youtube_data[a].liveDetails.scheduledStartTime
          ) {
            TimeToCheck = youtube_data[a].publishedAt;
          } else if (
            youtube_data[a].liveBroadcastContent === "live" &&
            youtube_data[a].liveDetails &&
            youtube_data[a].liveDetails.actualStartTime
          ) {
            TimeToCheck = youtube_data[a].liveDetails.actualStartTime;
          } else if (youtube_data[a].liveBroadcastContent === "none") {
            TimeToCheck = youtube_data[a].publishedAt;
          } else {
            continue;
          }
          if (moment(TimeToCheck).isAfter(moment(SwapDate))) {
            SwapDate = TimeToCheck;
          }
          if (moment(TimeToCheck).isAfter(moment(this.youtube_list[i].last_posted_date))) {
            const guildSettings = this.guild_settings.find(
              (e) => e.guildId === send_feed_here.guild.id,
            );
            const lang = this.localization_manager.getLanguage(
              await guildSettings.settings_db.getData("/language"),
            );
            if (
              [
                "@everyone", "@here",
              ].includes(this.youtube_list[i].mention)
            ) {
              message_text = this.youtube_list[i].mention;
            } else if (this.youtube_list[i].mention) {
              message_text = `<@&${this.youtube_list[i].mention}>`;
            }
            switch (youtube_data[a].liveBroadcastContent) {
              case "upcoming": {
                message_text += ` ${lang.youtube_newupcoming.replace("{u}", this.youtube_list[i].youtube_user)}`;
                break;
              }
              case "live": {
                message_text += ` ${lang.youtube_stream.replace("{u}", this.youtube_list[i].youtube_user)}`;
                break;
              }
              default: {
                message_text += ` ${lang.youtube_newvideo.replace("{u}", this.youtube_list[i].youtube_user)}`;
                break;
              }
            }
            message_text += ` https://www.youtube.com/watch?v=${youtube_data[a].videoId}`;
            await this.postThrottle.add(() => {
              return send_feed_here.send({
                content: message_text,
              });
            });
            this.youtube_list[i].last_video_ids.push(youtube_data[a].videoId);
            if (this.youtube_list[i].last_video_ids.length >= 6) {
              this.youtube_list[i].last_video_ids.shift();
            }
          }
        }
        this.youtube_list[i].last_posted_date = SwapDate;
      }
    });
  }
  async parse_rss(data) {
    const xml = new XMLParser({
      attributeNamePrefix: "",
      textNodeName: "$text",
      ignoreAttributes: false,
    });
    const result = xml.parse(data);
    let channel = result.rss && result.rss.channel ? result.rss.channel : result.feed;
    if (Array.isArray(channel)) channel = channel[0];
    const rss = {
      title: channel.title ?? "",
      description: channel.description ?? "",
      link: channel.link && channel.link.href ? channel.link.href : channel.link,
      image: channel.image
        ? channel.image.url
        : channel["itunes:image"]
          ? channel["itunes:image"].href
          : "",
      category: channel.category || [],
      items: [],
    };
    let items = channel.item || channel.entry || [];
    if (items && !Array.isArray(items))
      items = [
        items,
      ];
    for (let i = 0; i < items.length; i++) {
      const val = items[i];
      const media = {};
      const obj = {
        id: val.guid && val.guid.$text ? val.guid.$text : val.id,
        title: val.title && val.title.$text ? val.title.$text : val.title,
        description: val.summary && val.summary.$text ? val.summary.$text : val.description,
        link: val.link && val.link.href ? val.link.href : val.link,
        author: val.author && val.author.name ? val.author.name : val["dc:creator"],
        published: val.created
          ? Date.parse(val.created)
          : val.pubDate
            ? Date.parse(val.pubDate)
            : Date.now(),
        created: val.updated
          ? Date.parse(val.updated)
          : val.pubDate
            ? Date.parse(val.pubDate)
            : val.created
              ? Date.parse(val.created)
              : Date.now(),
        category: val.category || [],
        content: val.content && val.content.$text ? val.content.$text : val["content:encoded"],
        enclosures: val.enclosure
          ? Array.isArray(val.enclosure)
            ? val.enclosure
            : [
                val.enclosure,
              ]
          : [],
      };
      [
        "content:encoded", "podcast:transcript", "itunes:summary", "itunes:author",
        "itunes:explicit", "itunes:duration", "itunes:season", "itunes:episode",
        "itunes:episodeType", "itunes:image",
      ].forEach((s) => {
        if (val[s]) obj[s.replace(":", "_")] = val[s];
      });
      if (val["media:thumbnail"]) {
        Object.assign(media, { thumbnail: val["media:thumbnail"] });
        obj.enclosures.push(val["media:thumbnail"]);
      }
      if (val["media:content"]) {
        Object.assign(media, { thumbnail: val["media:content"] });
        obj.enclosures.push(val["media:content"]);
      }
      if (val["media:group"]) {
        if (val["media:group"]["media:title"]) obj.title = val["media:group"]["media:title"];

        if (val["media:group"]["media:description"])
          obj.description = val["media:group"]["media:description"];

        if (val["media:group"]["media:thumbnail"])
          obj.enclosures.push(val["media:group"]["media:thumbnail"].url);

        if (val["media:group"]["media:content"])
          obj.enclosures.push(val["media:group"]["media:content"]);
      }
      Object.assign(obj, { media });
      rss.items.push(obj);
    }
    return rss;
  }
  async fetchWithRetry(url, options = {}, retries = 5, delay = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response;
      } catch (error) {
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }
  async LoadEvents() {
    const EventsDir = join(__dirname, "..", "events");
    try {
      const files = await readdir(EventsDir);
      for (const file of files) {
        if ((!file.endsWith(".js") && !file.endsWith(".mjs")) || file === "deployGlobal.js")
          continue; // Skip non-js files

        const eventFilePath = join(EventsDir, file);
        const eventFileURL = pathToFileURL(eventFilePath).href;
        const eventName = basename(file, ".js");

        try {
          const eventModule = await import(eventFileURL);
          const event = eventModule.default;

          if (typeof event !== "function") {
            this.warn(`Event file ${file} does not export a function.`);
            continue;
          }
          this.on(eventName, event.bind(null, this));
          this.warn("Event Loaded: " + eventName);
        } catch (importErr) {
          this.warn(`Error loading event ${eventName} from ${file}: ${importErr}`);
        }
      }
    } catch (err) {
      console.error(`Error reading events directory ${EventsDir}:`, err);
    }
  }

  async LoadCommands() {
    // --- Load Slash Commands ---
    const SlashCommandsDirectory = join(__dirname, "..", "commands", "slash");
    try {
      const slashFiles = await readdir(SlashCommandsDirectory);
      for (const file of slashFiles) {
        if (!file.endsWith(".js") && !file.endsWith(".mjs")) continue;

        const commandFilePath = join(SlashCommandsDirectory, file);
        // Create the URL:
        const commandFileURL = pathToFileURL(commandFilePath).href;
        const commandName = basename(file, ".js");

        try {
          const cmdModule = await import(commandFileURL);
          const cmd = cmdModule.default;

          if (!cmd || typeof cmd.run !== "function") {
            this.warn(
              `Unable to load Slash Command: ${commandName}, File doesn't have a valid default export with a run function`,
            );
            continue; // Skip this file
          }
          this.slashCommands.set(commandName.toLowerCase(), cmd);
          this.log("Slash Command Loaded: " + commandName);
        } catch (importErr) {
          this.warn(`Error loading slash command ${commandName} from ${file}: ${importErr}`);
        }
      }
    } catch (err) {
      console.error(`Error reading slash commands directory ${SlashCommandsDirectory}:`, err);
    }

    // --- Load Context Menu Commands ---
    const ContextCommandsDirectory = join(__dirname, "..", "commands", "context");
    try {
      const contextFiles = await readdir(ContextCommandsDirectory);
      for (const file of contextFiles) {
        if (!file.endsWith(".js") && !file.endsWith(".mjs")) continue;
        const commandFilePath = join(ContextCommandsDirectory, file);
        // Create the URL:
        const commandFileURL = pathToFileURL(commandFilePath).href;
        const commandName = basename(file, ".js");

        try {
          const cmdModule = await import(commandFileURL);
          const cmd = cmdModule.default;

          if (!cmd || typeof cmd.run !== "function") {
            this.warn(
              `Unable to load Context Command: ${commandName}, File doesn't have a valid default export with a run function (and optionally command info)`,
            );
            continue; // Skip this file
          }
          this.contextCommands.set(commandName.toLowerCase(), cmd);
          this.log("ContextMenu Loaded: " + commandName);
        } catch (importErr) {
          this.warn(`Error loading context command ${commandName} from ${file}: ${importErr}`);
        }
      }
    } catch (err) {
      console.error(`Error reading context commands directory ${ContextCommandsDirectory}:`, err);
      // throw err;
    }
  }
}
export default DiscordMusicBot;
