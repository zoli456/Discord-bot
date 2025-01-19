"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientWithTempManager = void 0;
const discord_js_1 = require("discord.js");
const TempChannelsManager_1 = require("./TempChannelsManager");
/**
 * A wrapper of {@link Client} that provides a support for the {@link TempChannelsManager}.
 * @export
 * @class ClientWithTempManager
 * @extends {Client}
 */
class ClientWithTempManager extends discord_js_1.Client {
    /**
     * An instance of {@link TempChannelsManager} that currently manages all the temporary channels for the client.
     *
     * @name ClientWithTempManager#tempChannelsManager
     * @type {TempChannelsManager}
     */
    tempChannelsManager;
    /**
     * Creates an instance of ClientWithTempManager.
     * @param {ClientOptions} [options] Options for the client
     * @memberof ClientWithTempManager
     */
    constructor(options) {
        super(options);
        this.tempChannelsManager = new TempChannelsManager_1.TempChannelsManager(this);
    }
}
exports.ClientWithTempManager = ClientWithTempManager;
