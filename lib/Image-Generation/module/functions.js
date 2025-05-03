import https from "https";

/**
 * Create a responsive font size for the given text so it fits within a max width.
 * @param {Canvas} canvas      The canvas object
 * @param {string} text        The text to measure
 * @param {number} defaultFontSize  The starting font size (in px)
 * @param {number} width       The maximum width (in px)
 * @param {string} font        The font family
 * @returns {string}           The final canvas.font string (e.g. "24px sans-serif")
 */
export const applyText = (canvas, text, defaultFontSize, width, font) => {
  const ctx = canvas.getContext("2d");
  // decrease font size until text fits within width
  do {
    defaultFontSize -= 1;
    ctx.font = `${defaultFontSize}px ${font}`;
  } while (ctx.measureText(text).width > width);
  return ctx.font;
};

/**
 * Wrap a long string into multiple lines so each line is under maxWidth.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} maxWidth
 * @returns {Promise<string[] | null>}
 */
export const wrapText = (ctx, text, maxWidth) =>
  new Promise((resolve) => {
    if (ctx.measureText(text).width < maxWidth) {
      return resolve([
        text,
      ]);
    }
    if (ctx.measureText("W").width > maxWidth) {
      return resolve(null);
    }

    const words = text.split(" ");
    const lines = [];
    let line = "";

    while (words.length > 0) {
      let split = false;
      // break words that themselves are too long
      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if (split) {
          words[1] = `${temp.slice(-1)}${words[1]}`;
        } else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }
      // if adding the next word still fits, add it
      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
        line += `${words.shift()} `;
      } else {
        // otherwise, finalize the current line and start a new one
        lines.push(line.trim());
        line = "";
      }

      if (words.length === 0) {
        lines.push(line.trim());
      }
    }

    resolve(lines);
  });

/**
 * Validate that a URL is HTTPS and points to an image; if so, download and return its Buffer.
 * @param {string|Buffer} url
 * @returns {Promise<Buffer|false>}
 */
export const validateURL = async (url) => {
  if (!url) return false;
  if (Buffer.isBuffer(url)) {
    return url;
  }
  if (typeof url !== "string" || !url.startsWith("https")) {
    return false;
  }

  try {
    return await new Promise((resolve) => {
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          return resolve(false);
        }
        const contentType = response.headers["content-type"] || "";
        if (!contentType.startsWith("image/")) {
          return resolve(false);
        }
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
      });
    });
  } catch {
    return false;
  }
};
export default {
  applyText,
  wrapText,
  validateURL,
};
