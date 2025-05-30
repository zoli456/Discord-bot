/**
 * Color conversion from hex to rgba
 * @param {string} hex hex color code
 * @param {number} opacity opacity from rgba (default 1)
 * @returns {string} rgba color string
 * @throws {Error} when invalid hex is provided
 */
const hexToRgbA = (hex, opacity = 1) => {
  let c;
  if (hex.length === 9 && hex.includes("#")) hex = hex.slice(0, 7);
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [
        c[0], c[0], c[1], c[1],
        c[2], c[2],
      ];
    }
    c = "0x" + c.join("");
    return (
      "rgba(" +
      [
        (c >> 16) & 255, (c >> 8) & 255, c & 255,
      ].join(",") +
      `,${opacity})`
    );
  }
  throw new Error("Bad Hex");
};

export default hexToRgbA;
