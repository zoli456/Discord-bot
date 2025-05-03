/**
 * Converts text to Discord emoji representation
 * @param {string} content - The text to convert
 * @returns {string} The converted emoji string
 */
export default function textToEmoji(content) {
  if (typeof content !== "string") return "";

  return content
    .toLowerCase()
    .split("")
    .map((letter) => {
      if (/[a-z]/.test(letter)) return `:regional_indicator_${letter}:`;
      if (chars[letter]) return chars[letter];
      return letter;
    })
    .join("");
}

/**
 * Mapping of special characters to their emoji equivalents
 * @type {Object.<string, string>}
 */
export const chars = {
  0: ":zero:",
  1: ":one:",
  2: ":two:",
  3: ":three:",
  4: ":four:",
  5: ":five:",
  6: ":six:",
  7: ":seven:",
  8: ":eight:",
  9: ":nine:",
  "#": ":hash:",
  "*": ":asterisk:",
  "?": ":grey_question:",
  "!": ":grey_exclamation:",
  "+": ":heavy_plus_sign:",
  "-": ":heavy_minus_sign:",
  "×": ":heavy_multiplication_x:",
  $: ":heavy_dollar_sign:",
  "/": ":heavy_division_sign:",
  " ": "   ",
};
