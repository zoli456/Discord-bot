/**
 * Color conversion from rgb | rgba to hex
 * @param {string} rgb - rgb or rgba color string
 * @returns {string} hex color (with "#")
 * @throws {Error} when invalid rgb/a is provided
 */
const rgbToHex = (rgb) => {
  let matchColors = /(rgb|rgba)\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})/;
  const match = matchColors.exec(rgb);
  if (match !== null) {
    return "#" + ((1 << 24) | (match[2] << 16) | (match[3] << 8) | match[4]).toString(16).slice(1);
  }
  throw new Error("Bad Rgb");
};

export default rgbToHex;
