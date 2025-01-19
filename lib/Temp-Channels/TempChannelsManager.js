const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempChannelsManager = void 0;
const discord_js_1 = require("discord.js");
const VoiceChannelsManager_1 = require("./VoiceChannelsManager");
const TempChannelsManagerEvents_1 = require("./TempChannelsManagerEvents");
const { PermissionsBitField } = require("discord.js");
/**
 * The temporary channels manager.
 * @export
 * @class TempChannelsManager
 * @extends {EventEmitter}
 */
class TempChannelsManager extends VoiceChannelsManager_1.VoiceChannelsManager {
  client;
  /**
   * Creates an instance of TempChannelsManager.
   * @param {Client} client
   * @memberof TempChannelsManager
   */
  constructor(client) {
    super();
    const intents = new discord_js_1.IntentsBitField(client.options.intents);
    if (!intents.has(discord_js_1.IntentsBitField.Flags.GuildVoiceStates)) {
      throw new Error(
        "GUILD_VOICE_STATES intent is required to use this package!",
      );
    }
    if (!intents.has(discord_js_1.IntentsBitField.Flags.Guilds)) {
      throw new Error("GUILDS intent is required to use this package!");
    }
    this.client = client;
    this.listenToChannelEvents();
  }
  /**
   * Registers a parent channel. When a user joins a it, a child will be created and they will be moved to it.
   *
   * @param {Snowflake} channelId
   * @param {ParentChannelOptions} [options={
   *       childCategory: null,
   *       childAutoDeleteIfEmpty: true,
   *       childAutoDeleteIfOwnerLeaves: false,
   *       childFormat: (name, count) => `[DRoom ${count}] ${name}`,
   *       childFormatRegex: /^\[DRoom \d+\]\s+.+/i,
   *       childPermissionOverwriteOption: { 'ManageChannels': true }
   *     }]
   */
  registerChannel(
    channelId,
    options = {
      childCategory: null,
      childAutoDeleteIfEmpty: true,
      childAutoDeleteIfOwnerLeaves: false,
      childVoiceFormat: (name, count) => `[DRoom ${count}] ${name}`,
      childVoiceFormatRegex: /^\[DRoom \d+\]\s+.+/i,
      childPermissionOverwriteOptions: { ManageChannels: true },
      childShouldBeACopyOfParent: false,
      listChannelToRestore: null,
    },
  ) {
    super.registerChannel(channelId, options);
  }
  /**
   * Unregisters a parent channel. When a user joins it, nothing will happen.
   *
   * @param {Snowflake} channelId
   */
  unregisterChannel(channelId) {
    const hasBeenUnregistered = super.unregisterChannel(channelId);
    if (!hasBeenUnregistered) {
      this.emit(
        TempChannelsManagerEvents_1.TempChannelsManagerEvents.error,
        null,
        `Could not unregister the channel with the id ${channelId}`,
      );
    }
    return hasBeenUnregistered;
  }
  listenToChannelEvents() {
    /* this.client.on(
      "voiceChannelJoin",
      async (member, channel) =>
        await this.createNewChild.apply(this, [member, channel]),
    );
    this.client.on(
      "voiceChannelSwitch",
      async (member, previousChannel, currentChannel) =>
        await this.handleChild.apply(this, [
          member,
          previousChannel,
          currentChannel,
        ]),
    );
    this.client.on(
      "voiceChannelLeave",
      async (member, channel) =>
        await this.checkChildForDeletion.apply(this, [channel]),
    );*/
    // this.client.on(Events.ChannelUpdate, async (oldState: DMChannel | NonThreadGuildBasedChannel, newState: DMChannel | NonThreadGuildBasedChannel) => await this.handleChannelRenaming.apply(this, [oldState, newState]));
    this.client.on(discord_js_1.Events.ChannelDelete, (channel) =>
      this.cleanUpAfterDeletion.apply(this, [channel]),
    );
    this.on(
      TempChannelsManagerEvents_1.TempChannelsManagerEvents.channelRegister,
      async (parent) => await this.restoreAfterCrash.apply(this, [parent]),
    );
    this.on(
      TempChannelsManagerEvents_1.TempChannelsManagerEvents.channelUnregister,
      async (parent) => {
        if (parent.options.childAutoDeleteIfParentGetsUnregistered) {
          for (const child of parent.children) {
            await this.deleteVoiceChannel.apply(this, [child.voiceChannel]);
          }
        }
      },
    );
  }
  async deleteVoiceChannel(channel) {
    try {
      await channel.delete();
    } catch (error) {
      this.emit(
        TempChannelsManagerEvents_1.TempChannelsManagerEvents.error,
        error,
        "Cannot auto delete channel " + channel.id,
      );
    }
  }
  async restoreAfterCrash(parentData) {
    if (!parentData) return;
    const parent = this.getParentChannel(parentData.channelId);
    const voiceChannel = await this.client.channels.fetch(parent.channelId);
    if (!voiceChannel) return;
    const bot = await voiceChannel.guild.members.fetch(this.client.user);
    const category = await voiceChannel.guild.channels.fetch(
      parent.options.childCategory ?? voiceChannel.parentId,
    );
    const children = (
      category?.children ?? voiceChannel.guild.channels
    ).cache.filter(
      (c) =>
        /*parent.options.childVoiceFormatRegex.test(c.name) &&*/
        c.type === discord_js_1.ChannelType.GuildVoice &&
        c.id !== parent.channelId &&
        c.permissionOverwrites.cache.some(
          (po) => po.type === discord_js_1.OverwriteType.Member,
        ),
    );
    for (let child of [...children.values()]) {
      child = await this.client.channels.fetch(child.id);
      this.bindChannelToParent(
        parent,
        child,
        child.members.size > 0 ? child.members.first() : bot,
      );
      await this.checkChildForDeletion(child);
    }
  }
  /**
   * @deprecated The method should not be used
   */
  async handleChannelRenaming(oldState, newState) {
    if (oldState.isDMBased() || newState.isDMBased()) return;
    if (oldState.name === newState.name) return;
    const parent = this.getParentChannel(newState.id, true);
    if (!parent) return;
    const child = parent.children.find(
      (c) => c.voiceChannel.id === newState.id,
    );
    const nameDoesNotHavePrefix = !parent.options.childVoiceFormatRegex.test(
      newState.name,
    );
    if (!parent.options.childCanBeRenamed && nameDoesNotHavePrefix) {
      const count = parent.children.indexOf(child) + 1;
      const nameWithPrefix = parent.options.childVoiceFormat(
        newState.name,
        count,
      );
      await newState.setName(nameWithPrefix);
      this.emit(
        TempChannelsManagerEvents_1.TempChannelsManagerEvents.childPrefixChange,
        child,
      );
    }
  }
  async checkChildForDeletion(channel) {
    const parent = this.getParentChannel(channel.id, true);
    if (!parent) return;
    const child = parent.children.find((c) => c.voiceChannel.id === channel.id);
    const shouldBeDeleted =
      (parent.options.childAutoDeleteIfEmpty &&
        child.voiceChannel.members.size === 0) ||
      (parent.options.childAutoDeleteIfOwnerLeaves &&
        !child.voiceChannel.members.has(child.owner.id));
    if (!shouldBeDeleted) return;
    await this.deleteVoiceChannel(channel);
  }
  async handleChild(member, oldChannel, newChannel) {
    await this.checkChildForDeletion(oldChannel);
    await this.createNewChild(member, newChannel);
  }
  async createNewChild(member, channel) {
    const parent = this.getParentChannel(channel.id);
    if (!parent) return;
    if (this.client.tempchannel_Limiter.take(member.id)) {
      return;
    }
    const parentChannel = await this.client.channels.fetch(parent.channelId);
    const count = parent.children.length + 1;
    let name = parent.options.childVoiceFormat(member.displayName, count);
    for (let i = 1; i <= parent.children.length; i++) {
      if (
        !parent.children.find(
          (e) =>
            e.voiceChannel.name ===
            parent.options.childVoiceFormat(member.displayName, i),
        )
      ) {
        name = parent.options.childVoiceFormat(member.displayName, i);
        break;
      }
    }
    let categoryChannel = null;
    if (parent.options.childCategory) {
      categoryChannel = await channel.guild.channels.fetch(
        parent.options.childCategory,
      );
    } else if (parentChannel.parentId) {
      categoryChannel = await channel.guild.channels.fetch(
        parentChannel.parentId,
      );
    }
    let voiceChannel = null;
    if (parent.options.childShouldBeACopyOfParent) {
      voiceChannel = await parentChannel.clone({
        name,
      });
      await voiceChannel.permissionOverwrites.edit(member.id, {
        Connect: true,
      });
    } else {
      voiceChannel = await channel.guild.channels.create({
        name,
        parent: categoryChannel?.id ?? null,
        bitrate: parent.options.childBitrate,
        userLimit: parent.options.childMaxUsers,
        type: discord_js_1.ChannelType.GuildVoice,
        permissionOverwrites: categoryChannel
          ? [
              ...categoryChannel.permissionOverwrites.cache.values(),
              {
                id: member.id,
                allow: PermissionsBitField.Flags.Connect,
              },
            ]
          : [
              {
                id: member.id,
                allow: PermissionsBitField.Flags.Connect,
              },
            ],
      });
    }
    /*await voiceChannel.permissionOverwrites.edit(member.id, {
      ManageChannels: true,
    });*/
    if (parent.options.childPermissionOverwriteOptions) {
      for (const roleOrUser of parent.options.childOverwriteRolesAndUsers) {
        try {
          await voiceChannel.permissionOverwrites.edit(
            roleOrUser,
            parent.options.childPermissionOverwriteOptions,
          );
        } catch (error) {
          this.emit(
            TempChannelsManagerEvents_1.TempChannelsManagerEvents.error,
            error,
            `Couldn't update the permissions of the channel ${
              voiceChannel.id
            } for role or user ${roleOrUser.toString()}`,
          );
        }
      }
    }
    // Set a new channel position
    voiceChannel
      .setPosition(count)
      /*.then((newChannel) =>
        console.log(`Channel's new position is ${newChannel.position}`),
      )*/
      .catch(console.error);
    this.bindChannelToParent(parent, voiceChannel, member, count);
    await member.voice.setChannel(voiceChannel);
  }
  cleanUpAfterDeletion(channel) {
    if (!channel || channel.type !== discord_js_1.ChannelType.GuildVoice)
      return;
    let parent = this.getParentChannel(channel.id);
    if (parent) {
      this.unregisterChannel(channel.id);
      return;
    }
    parent = this.getParentChannel(channel.id, true);
    if (!parent) return;
    this.unbindChannelFromParent(parent, channel.id);
  }
}
exports.TempChannelsManager = TempChannelsManager;
/**
 * Emitted when a voice channel name is changed because it does not respect the prefix regular expression.
 * @event TempChannelsManagerchildPrefixChange
 * @see TempChannelsManagerEventschildPrefixChange
 * @param {ChildChannelData} child The child channel data
 * @example
 * manager.on('childPrefixChange', (child) => {});
 */
