import { ActionRowBuilder, ButtonBuilder as DiscordButtonBuilder } from "discord.js";
import { decode as htmlDecode } from "html-entities";

/**
 * Utility functions for Discord bot development
 */
export const Utils = {
  /**
   * Disables all buttons in message components
   * @param {import('discord.js').ActionRowBuilder[]} components - Array of message action rows
   * @returns {import('discord.js').ActionRowBuilder[]} Modified components with disabled buttons
   */
  disableButtons(components) {
    return components.map((row) => {
      const newRow = new ActionRowBuilder();
      newRow.addComponents(
        row.components.map((component) => {
          const button = new ButtonBuilder(component.data);
          return button.setDisabled(true);
        }),
      );
      return newRow;
    });
  },

  /**
   * Gets number emoji for a given digit (0-10)
   * @param {number} number - The number (0-10)
   * @returns {string} Corresponding emoji
   * @throws {Error} If number is out of range
   */
  getNumEmoji(number) {
    const numEmoji = [
      "0️⃣", "1️⃣", "2️⃣", "3️⃣",
      "4️⃣", "5️⃣", "6️⃣", "7️⃣",
      "8️⃣", "9️⃣", "🔟",
    ];
    if (number < 0 || number > 10) {
      throw new Error("Number must be between 0 and 10");
    }
    return numEmoji[number];
  },

  /**
   * Formats message content with player placeholders
   * @param {Object} options - Formatting options
   * @param {import('discord.js').User} options.message.author - Message author
   * @param {import('discord.js').User} options.opponent - Opponent user
   * @param {string} options.contentMsg - Message template
   * @returns {string} Formatted message
   */
  formatMessage(options, contentMsg) {
    const { message, opponent } = options;
    let content = options[contentMsg];

    const replacements = {
      "{player.tag}": message.author.tag,
      "{player.username}": message.author.username,
      "{player}": `<@!${message.author.id}>`,
      "{opponent.tag}": opponent?.tag || "",
      "{opponent.username}": opponent?.username || "",
      "{opponent}": opponent ? `<@!${opponent.id}>` : "",
    };

    return Object.entries(replacements).reduce(
      (
        str,
        [
          key, val,
        ],
      ) => str.replace(key, val),
      content,
    );
  },

  /**
   * Decodes HTML entities in text
   * @param {string} content - Text with HTML entities
   * @returns {string} Decoded text
   */
  decode: htmlDecode,

  /**
   * Calculates new position based on direction
   * @param {{x: number, y: number}} pos - Current position
   * @param {'up'|'down'|'left'|'right'} direction - Movement direction
   * @returns {{x: number, y: number}} New position
   */
  move(pos, direction) {
    const moves = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    const move = moves[direction] || { x: 0, y: 0 };
    return { x: pos.x + move.x, y: pos.y + move.y };
  },

  /**
   * Gets opposite direction
   * @param {'up'|'down'|'left'|'right'} direction - Original direction
   * @returns {'up'|'down'|'left'|'right'} Opposite direction
   */
  oppDirection(direction) {
    const opposites = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };
    return opposites[direction];
  },

  /**
   * Gets regional indicator emoji for a letter
   * @param {string} letter - Single letter A-Z
   * @returns {string} Corresponding emoji flag
   */
  getAlphaEmoji(letter) {
    const codePointA = "A".codePointAt(0);
    if (typeof letter === "number") {
      return letter === 0 ? "🇦-🇱" : "🇲-🇿";
    }
    if (!/^[A-Z]$/.test(letter)) return "";
    return String.fromCodePoint(letter.toUpperCase().codePointAt(0) - codePointA + 0x1f1e6);
  },

  /**
   * Shuffles array in place using Fisher-Yates algorithm
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array (same reference)
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [
        array[i], array[j],
      ] = [
        array[j], array[i],
      ];
    }
    return array;
  },

  /**
   * Generates random integer in range [min, max]
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @returns {number} Random integer
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
};

/**
 * Extended ButtonBuilder with additional methods
 */
export class ButtonBuilder extends DiscordButtonBuilder {
  /**
   * Sets button style using string names
   * @param {'PRIMARY'|'SECONDARY'|'SUCCESS'|'DANGER'} style - Style name
   * @returns {ButtonBuilder} This builder
   */
  setStyle(style) {
    const styleMap = {
      PRIMARY: 1,
      SECONDARY: 2,
      SUCCESS: 3,
      DANGER: 4,
    };
    this.data.style = styleMap[style] || 2;
    return this;
  }

  /**
   * Removes label from button
   * @returns {ButtonBuilder} This builder
   */
  removeLabel() {
    this.data.label = undefined;
    return this;
  }

  /**
   * Removes emoji from button
   * @returns {ButtonBuilder} This builder
   */
  removeEmoji() {
    this.data.emoji = undefined;
    return this;
  }
}

// Export individual functions as named exports
export const {
  disableButtons,
  getNumEmoji,
  formatMessage,
  decode,
  move,
  oppDirection,
  getAlphaEmoji,
  shuffleArray,
  randomInt,
  buttonStyle,
} = Utils;

export default Utils;
