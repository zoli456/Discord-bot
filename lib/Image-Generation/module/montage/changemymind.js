import { createCanvas, loadImage } from "canvas";
const __dirname = import.meta.dirname;

export default class Changemymind {
  async getImage(text) {
    if (!text) throw new Error("No text was provided!");
    const base = await loadImage(`${__dirname}/../../assets/changemymind.jpg`);
    const canvas = await createCanvas(base.width, base.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
    let x = text.length;
    let fontSize = 70;
    if (x <= 15) {
      ctx.translate(310, 365);
    } else if (x <= 30) {
      fontSize = 50;
      ctx.translate(315, 365);
    } else if (x <= 70) {
      fontSize = 40;
      ctx.translate(315, 365);
    } else if (x <= 85) {
      fontSize = 32;
      ctx.translate(315, 365);
    } else if (x < 100) {
      fontSize = 26;
      ctx.translate(315, 365);
    } else if (x < 120) {
      fontSize = 21;
      ctx.translate(315, 365);
    } else if (x < 180) {
      fontSize = 0.0032 * (x * x) - 0.878 * x + 80.545;
      ctx.translate(315, 365);
    } else if (x < 700) {
      fontSize = 0.0000168 * (x * x) - 0.0319 * x + 23.62;
      ctx.translate(310, 338);
    } else {
      fontSize = 7;
      ctx.translate(310, 335);
    }
    ctx.font = `${fontSize}px 'Arial'`;
    ctx.rotate(-0.39575);

    const lines = this.getLines({ text, ctx, maxWidth: 345 });
    let i = 0;
    while (i < lines.length) {
      ctx.fillText(lines[i], 10, i * fontSize - 5);
      i++;
    }
    return canvas.toBuffer("image/jpeg");
  }
  getLines({ text, ctx, maxWidth }) {
    if (!text) return [];
    if (!ctx) throw new Error("Canvas context was not provided!");
    if (!maxWidth) throw new Error("No max-width provided!");
    const lines = [];

    while (text.length) {
      let i;
      for (i = text.length; ctx.measureText(text.substring(0, i)).width > maxWidth; i -= 1);
      const result = text.substring(0, i);
      let j;
      if (i !== text.length)
        for (j = 0; result.indexOf(" ", j) !== -1; j = result.indexOf(" ", j) + 1);
      lines.push(result.substring(0, j || result.length));
      text = text.substring(lines[lines.length - 1].length, text.length);
    }

    return lines;
  }
}
