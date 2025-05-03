import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import { wrapText } from "../functions.js";
const __dirname = import.meta.dirname;

// Register fonts
registerFont(path.join(__dirname, "../../assets/fonts/Noto-Regular.ttf"), {
  family: "Noto",
});
registerFont(path.join(__dirname, "../../assets/fonts/Noto-Emoji.ttf"), {
  family: "Noto",
});

export default class LisaPresentation {
  async getImage(text) {
    if (!text || text.length > 300) {
      throw new Error("You must provide a text of 300 characters or less.");
    }

    // Load base image
    const base = await loadImage(path.join(__dirname, "../../assets/lisa-presentation.png"));

    // Create canvas
    const canvas = createCanvas(base.width, base.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(base, 0, 0);

    // Text settings
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    let fontSize = 40;
    ctx.font = `${fontSize}px Noto`;

    // Reduce font size until text fits
    while (ctx.measureText(text).width > 1320 && fontSize > 10) {
      fontSize -= 1;
      ctx.font = `${fontSize}px Noto`;
    }

    // Wrap text and calculate vertical offset
    const lines = await wrapText(ctx, text, 1320);
    const totalHeight = fontSize * lines.length + 20 * (lines.length - 1);
    const topMost = 185 - totalHeight / 2;

    // Draw each line
    lines.forEach((line, i) => {
      const y = topMost + (fontSize + 20) * i;
      ctx.fillText(line, base.width / 2, y);
    });

    // Return JPEG buffer
    return canvas.toBuffer("image/jpeg");
  }
}
