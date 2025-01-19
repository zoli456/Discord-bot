"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceChannelsManager = void 0;
const discord_js_1 = require("discord.js");
const events_1 = require("events");
const TempChannelsManagerEvents_1 = require("./TempChannelsManagerEvents");
/**
 * A voice channels manager, handling the relationship between parents and children channels.
 *
 * @export
 * @class VoiceChannelsManager
 * @extends {EventEmitter}
 */
class VoiceChannelsManager extends events_1.EventEmitter {
    #channels;
    /**
     * Creates an instance of VoiceChannelsManager.
     * @memberof VoiceChannelsManager
     */
    constructor() {
        super();
        this.#channels = new discord_js_1.Collection();
    }
    /**
     * Gets the parent channel either based on its ID or by looking for a match
     * on the provided ID and its list of children.
     *
     * @protected
     * @param {Snowflake} channelId
     * @param {boolean} [lookAsChild=false]
     * @return {*}  {ParentChannelData}
     * @memberof VoiceChannelsManager
     */
    getParentChannel(channelId, lookAsChild = false) {
        if (lookAsChild) {
            return this.#channels.find(parent => parent.children.some(child => child.voiceChannel.id === channelId));
        }
        return this.#channels.get(channelId);
    }
    /**
     * Adds a parent channel into the collection.
     * Emits the {@link TempChannelsManagerEvents.channelRegister} event.
     *
     * @param {Snowflake} channelId
     * @param {ParentChannelOptions} options
     * @memberof VoiceChannelsManager
     */
    registerChannel(channelId, options) {
        const parent = { channelId, options, children: [] };
        this.#channels.set(channelId, parent);
        this.emit(TempChannelsManagerEvents_1.TempChannelsManagerEvents.channelRegister, parent);
    }
    /**
     * Removes a registered parent channel from the collection, unbinding all children at the same time.
     * Emits the {@link TempChannelsManagerEvents.channelUnregister} event.
     *
     * @param {Snowflake} channelId
     * @return {*}  {boolean}
     * @memberof VoiceChannelsManager
     */
    unregisterChannel(channelId) {
        const parent = this.#channels.get(channelId);
        if (!parent)
            return false;
        const unregisteredSuccessfully = this.#channels.delete(channelId);
        if (unregisteredSuccessfully) {
            this.emit(TempChannelsManagerEvents_1.TempChannelsManagerEvents.channelUnregister, parent);
            parent.children.forEach(child => this.unbindChannelFromParent(parent, child.voiceChannel.id));
        }
        return unregisteredSuccessfully;
    }
    /**
     * Adds a voice channel as a child of a parent.
     * Emits the {@link TempChannelsManagerEvents.childAdd} event.
     *
     * @param {ParentChannelData} parent
     * @param {VoiceChannel} voiceChannel
     * @param {GuildMember} owner
     * @return {*}  {void}
     * @memberof VoiceChannelsManager
     */
    bindChannelToParent(parent, voiceChannel, owner, orderChannel) {
        if (!parent)
            return;
        const child = { owner, voiceChannel, orderChannel };
        parent.children.push(child);
        this.emit(TempChannelsManagerEvents_1.TempChannelsManagerEvents.childAdd, child, parent);
    }
    /**
     * Removes a voice channel from the list of children of a parent.
     * Emits the {@link TempChannelsManagerEvents.childRemove} event.
     *
     * @param {ParentChannelData} parent
     * @param {Snowflake} voiceChannelId
     * @return {*}  {void}
     * @memberof VoiceChannelsManager
     */
    unbindChannelFromParent(parent, voiceChannelId) {
        if (!parent)
            return;
        const index = parent.children.findIndex(c => c.voiceChannel.id === voiceChannelId);
        if (index === -1)
            return;
        const [child] = parent.children.splice(index, 1);
        this.emit(TempChannelsManagerEvents_1.TempChannelsManagerEvents.childRemove, child, parent);
    }
}
exports.VoiceChannelsManager = VoiceChannelsManager;
/**
 * Emitted when a parent channel is registered.
 * @event VoiceChannelsManager#channelRegister
 * @see TempChannelsManagerEvents#channelRegister
 * @param {ParentChannelData} parent The parent channel data
 * @example
 * manager.on('channelRegister', (parent) => {});
 */
/**
 * Emitted when a parent channel is unregistered.
 * @event VoiceChannelsManager#channelUnregister
 * @see TempChannelsManagerEvents#channelUnregister
 * @param {ParentChannelData} parent The parent channel data
 * @example
 * manager.on('channelUnregister', (parent) => {});
 */
/**
 * Emitted when a voice channel is added as a child to a parent.
 * @event VoiceChannelsManager#childAdd
 * @see TempChannelsManagerEvents#childAdd
 * @param {ChildChannelData} child The child channel data
 * @param {ParentChannelData} parent The parent channel data
 * @example
 * manager.on('childAdd', (child, parent) => {});
 */
/**
 * Emitted when a voice channel is removed from the list of children of a parent.
 * @event VoiceChannelsManager#childRemove
 * @see TempChannelsManagerEvents#childRemove
 * @param {ChildChannelData} child The child channel data
 * @param {ParentChannelData} parent The parent channel data
 * @example
 * manager.on('childRemove', (child, parent) => {});
 */ 
