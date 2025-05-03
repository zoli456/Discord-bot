// lib/SlashCommand.js
import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  SlashCommandBuilder,
} from "discord.js";
import DiscordMusicBot from "./DiscordMusicBot.js";

export default class SlashCommand extends SlashCommandBuilder {
  constructor() {
    super();
    this.type = 1; // CHAT_INPUT
  }

  /**
   * Register the executor callback
   *
   * @param {(client: DiscordMusicBot, interaction: CommandInteraction, options: CommandInteractionOptionResolver) => Promise<any>} callback
   * @returns {this}
   */
  setRun(callback) {
    this.run = callback;
    return this;
  }
}
