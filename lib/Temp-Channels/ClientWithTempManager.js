import { Client } from "discord.js";
import { TempChannelsManager } from "./TempChannelsManager";

/**
 * A wrapper of {@link Client} that provides a support for the {@link TempChannelsManager}.
 * @export
 * @class ClientWithTempManager
 * @extends {Client}
 */
export class ClientWithTempManager extends Client {
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
    this.tempChannelsManager = new TempChannelsManager(this);
  }
}
