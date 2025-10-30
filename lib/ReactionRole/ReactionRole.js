import { EType } from "./types.js";
import { Client, ChannelType } from "discord.js";
import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig.js";
import { get, has, merge, set, unset } from "lodash-es";
import { parseFunction, stringifyFunction } from "./utils.js";

const __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }

    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }

      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }

      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }

      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
export class ReactionRole extends Client {
  constructor({}) {
    super({
      intents: [
        "GuildEmojisAndStickers", "GuildMembers", "GuildMessageReactions", "GuildMessages",
        "Guilds",
      ],
    });
    let db = new JsonDB(new Config("./info/reaction_roles", true, true, "/"));
    this.config = {};
    this.createOption = (clickable) => clickable;
    this.exportConfig = () => this.config;
    this.on_get = async () => await db.getData("/");
    this.on_delete = async (message_id) => await db.delete(`/${message_id}`);
    this.on_set = async (new_data) => await db.push("/", new_data);
  }
  onGet() {
    return this.on_get();
  }
  onSet(data) {
    return this.on_set(data);
  }
  onDelete(message_id) {
    return this.on_delete(message_id);
  }
  createMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
      const clone = Object.assign({}, message);
      for (const clickable of message.clickables) {
        if (clickable.onClick) clickable.onClick = (0, stringifyFunction)(clickable.onClick);
        if (clickable.onRemove) clickable.onRemove = (0, stringifyFunction)(clickable.onRemove);
      }
      (0, set)(this.config, message.message_id, message);
      if (this.on_set) yield this.on_set(this.config);
      return clone;
    });
  }
  deleteMessage(message_id) {
    return __awaiter(this, void 0, void 0, function* () {
      (0, unset)(this.config, message_id);
      if (this.on_delete) yield this.on_delete(message_id);
      return this.config;
    });
  }
  importConfig(config) {
    return __awaiter(this, void 0, void 0, function* () {
      (0, merge)(this.config, config);
      if (this.on_get) {
        const saved = (yield this.on_get()) || {};
        (0, merge)(saved, this.config);
        if (this.on_set) yield this.on_set(saved);
      }
      return this.config;
    });
  }
  async init(client) {
    let _a, _b, _c;
    if (this.on_get) {
      const saved = await this.on_get();
      if (saved) {
        this.importConfig(saved);
      }
    }
    for (const message_id in this.config) {
      const message = this.config[message_id];
      const channel = await client.channels.fetch(message.channel_id).catch(() => undefined);
      if (!channel || channel.type !== ChannelType.GuildText) {
        this.deleteMessage(message.message_id);
        continue;
      }
      const msg = await channel.messages.fetch(message.message_id).catch(() => undefined);
      if (!msg) {
        this.deleteMessage(message.message_id);
        continue;
      }
      for (const clickable of message.clickables) {
        if (
          !msg.reactions.cache.has(clickable.clickable_id) ||
          !((_b = msg.reactions.cache.get(clickable.clickable_id)) === null || _b === void 0
            ? void 0
            : _b.users.cache.has((_c = this.user) === null || _c === void 0 ? void 0 : _c.id))
        )
          await msg.react(clickable.clickable_id);
      }
    }
    client.logger.log(`Activated reaction roles on ${Object.keys(this.config).length} messages.`);
  }
  reInit() {
    return __awaiter(this, void 0, void 0, function* () {
      this.destroy();
      const rr = new ReactionRole({
        db_config: this._db_config,
      });
      yield rr.importConfig(this.config);
      return rr;
    });
  }
  async reaction(client, reaction, user) {
    var _d;
    if (reaction.partial) reaction = await reaction.fetch();
    if (!reaction.message.guild) return;
    if (user.partial) user = await user.fetch();
    if (!reaction.message.guild.members.cache.has(user.id)) return;
    if (!(0, has)(this.config, reaction.message.id)) return;
    const message = (0, get)(this.config, reaction.message.id);
    const clickable = message.clickables.find(
      (clickable) => clickable.clickable_id === (reaction.emoji.id || reaction.emoji.name),
    );
    if (!clickable) return;
    const member =
      (_d = reaction.message.guild) === null || _d === void 0
        ? void 0
        : _d.members.cache.get(user.id);
    if (message.limit && message.limit > 0) {
      const reactions = reaction.message.reactions.cache.filter(
        (r) =>
          message.clickables.some(
            (clickable) => clickable.clickable_id === (r.emoji.id || r.emoji.name),
          ) && r.users.cache.has(user.id),
      );
      if (reactions.size > message.limit) {
        await reaction.users.remove(user.id);
        return;
      }
    }
    const roles = clickable.roles.filter((id) =>
      clickable.type === EType.REMOVE ? member.roles.cache.has(id) : !member.roles.cache.has(id),
    );
    if (roles.length < 1) return;
    switch (clickable.type) {
      case EType.NORMAL:
        await member.roles.add(roles, "Reaction role");
        break;
      case EType.ONCE:
        await member.roles.add(roles, "Reaction role");
        await reaction.users.remove(member.id);
        break;
      case EType.REMOVE:
        await member.roles.remove(roles, "Reaction role");
        break;
      case EType.CUSTOM:
        await member.roles.add(roles, "Reaction role");
        if (clickable.onClick) {
          const fn = (0, parseFunction)(clickable.onClick);
          fn(clickable, member);
        }
    }
    const guildSettings = client.guild_settings.find((e) => e.guildId === member.guild.id);
    const lang = client.localization_manager.getLanguage(
      await guildSettings.settings_db.getData("/language"),
    );
    if (lang)
      await member
        .send(
          lang.reaction_role_add
            .replace("{role}", member.guild.roles.cache.get(roles[0]).name)
            .replace("{guild}", member.guild.name),
        )
        .catch(() => undefined);
    //await member.send(clickable.add_message).catch(() => undefined);
  }
  async unreaction(client, reaction, user) {
    var _e;
    if (reaction.partial) reaction = await reaction.fetch();
    if (!reaction.message.guild) return;
    if (user.partial) user = await user.fetch();
    if (!reaction.message.guild.members.cache.has(user.id)) return;
    if (!(0, has)(this.config, reaction.message.id)) return;
    const message = (0, get)(this.config, reaction.message.id);
    const clickable = message.clickables.find(
      (clickable) => clickable.clickable_id === (reaction.emoji.id || reaction.emoji.name),
    );
    if (!clickable) return;
    if (clickable.type === EType.ONCE) return;
    const member =
      (_e = reaction.message.guild) === null || _e === void 0
        ? void 0
        : _e.members.cache.get(user.id);
    const roles = clickable.roles.filter((id) =>
      clickable.type === EType.REMOVE ? !member.roles.cache.has(id) : member.roles.cache.has(id),
    );
    if (roles.length < 1) return;
    switch (clickable.type) {
      case EType.NORMAL:
        await member.roles.remove(roles, "Reaction role");
        break;
      case EType.REMOVE:
        await member.roles.add(roles, "Reaction role");
        break;
      case EType.CUSTOM:
        await member.roles.remove(roles, "Reaction role");
        if (clickable.onRemove) {
          const fn = (0, parseFunction)(clickable.onRemove);
          fn(clickable, member);
        }
    }
    const guildSettings = client.guild_settings.find((e) => e.guildId === member.guild.id);
    const lang = client.localization_manager.getLanguage(
      await guildSettings.settings_db.getData("/language"),
    );
    if (lang)
      await member
        .send(
          lang.reaction_role_remove
            .replace("{role}", member.guild.roles.cache.get(roles[0]).name)
            .replace("{guild}", member.guild.name),
        )
        .catch(() => undefined);
  }
}
