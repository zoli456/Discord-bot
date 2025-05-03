import { Events, IntentsBitField, ChannelType, OverwriteType } from "discord.js";
import { PermissionsBitField } from "discord.js";
import { VoiceChannelsManager } from "./VoiceChannelsManager.js";
import { TempChannelsManagerEvents } from "./TempChannelsManagerEvents.js";

/**
 * The temporary channels manager.
 * @export
 * @class TempChannelsManager
 * @extends {EventEmitter}
 */
export class TempChannelsManager extends VoiceChannelsManager {
  client;

  /**
   * Creates an instance of TempChannelsManager.
   * @param {Client} client
   * @memberof TempChannelsManager
   */
  constructor(client) {
    super();
    const intents = new IntentsBitField(client.options.intents);
    if (!intents.has(IntentsBitField.Flags.GuildVoiceStates)) {
      throw new Error("GUILD_VOICE_STATES intent is required to use this package!");
    }
    if (!intents.has(IntentsBitField.Flags.Guilds)) {
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
        TempChannelsManagerEvents.error,
        null,
        `Could not unregister the channel with the id ${channelId}`,
      );
    }
    return hasBeenUnregistered;
  }

  listenToChannelEvents() {
    this.client.on(Events.ChannelDelete, (channel) => this.cleanUpAfterDeletion(channel));

    this.on(
      TempChannelsManagerEvents.channelRegister,
      async (parent) => await this.restoreAfterCrash(parent),
    );

    this.on(TempChannelsManagerEvents.channelUnregister, async (parent) => {
      if (parent.options.childAutoDeleteIfParentGetsUnregistered) {
        for (const child of parent.children) {
          await this.deleteVoiceChannel(child.voiceChannel);
        }
      }
    });
  }

  async deleteVoiceChannel(channel) {
    try {
      await channel.delete();
    } catch (error) {
      this.emit(TempChannelsManagerEvents.error, error, "Cannot auto delete channel " + channel.id);
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
    const children = (category?.children ?? voiceChannel.guild.channels).cache.filter(
      (c) =>
        c.type === ChannelType.GuildVoice &&
        c.id !== parent.channelId &&
        c.permissionOverwrites.cache.some((po) => po.type === OverwriteType.Member),
    );

    for (let child of [
      ...children.values(),
    ]) {
      child = await this.client.channels.fetch(child.id);
      this.bindChannelToParent(parent, child, child.members.size > 0 ? child.members.first() : bot);
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
    const child = parent.children.find((c) => c.voiceChannel.id === newState.id);
    const nameDoesNotHavePrefix = !parent.options.childVoiceFormatRegex.test(newState.name);
    if (!parent.options.childCanBeRenamed && nameDoesNotHavePrefix) {
      const count = parent.children.indexOf(child) + 1;
      const nameWithPrefix = parent.options.childVoiceFormat(newState.name, count);
      await newState.setName(nameWithPrefix);
      this.emit(TempChannelsManagerEvents.childPrefixChange, child);
    }
  }

  async checkChildForDeletion(channel) {
    const parent = this.getParentChannel(channel.id, true);
    if (!parent) return;
    const child = parent.children.find((c) => c.voiceChannel.id === channel.id);
    const shouldBeDeleted =
      (parent.options.childAutoDeleteIfEmpty && child.voiceChannel.members.size === 0) ||
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
          (e) => e.voiceChannel.name === parent.options.childVoiceFormat(member.displayName, i),
        )
      ) {
        name = parent.options.childVoiceFormat(member.displayName, i);
        break;
      }
    }

    let categoryChannel = null;
    if (parent.options.childCategory) {
      categoryChannel = await channel.guild.channels.fetch(parent.options.childCategory);
    } else if (parentChannel.parentId) {
      categoryChannel = await channel.guild.channels.fetch(parentChannel.parentId);
    }

    let voiceChannel = null;
    if (parent.options.childShouldBeACopyOfParent) {
      voiceChannel = await parentChannel.clone({ name });
      await voiceChannel.permissionOverwrites.edit(member.id, { Connect: true });
    } else {
      voiceChannel = await channel.guild.channels.create({
        name,
        parent: categoryChannel?.id ?? null,
        bitrate: parent.options.childBitrate,
        userLimit: parent.options.childMaxUsers,
        type: ChannelType.GuildVoice,
        permissionOverwrites: categoryChannel
          ? [
              ...categoryChannel.permissionOverwrites.cache.values(), {
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

    if (parent.options.childPermissionOverwriteOptions) {
      for (const roleOrUser of parent.options.childOverwriteRolesAndUsers) {
        try {
          await voiceChannel.permissionOverwrites.edit(
            roleOrUser,
            parent.options.childPermissionOverwriteOptions,
          );
        } catch (error) {
          this.emit(
            TempChannelsManagerEvents.error,
            error,
            `Couldn't update the permissions of the channel ${voiceChannel.id} for role or user ${roleOrUser.toString()}`,
          );
        }
      }
    }

    voiceChannel.setPosition(count).catch(console.error);
    this.bindChannelToParent(parent, voiceChannel, member, count);
    await member.voice.setChannel(voiceChannel);
  }

  cleanUpAfterDeletion(channel) {
    if (!channel || channel.type !== ChannelType.GuildVoice) return;
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
