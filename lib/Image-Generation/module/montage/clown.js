import { createCanvas, loadImage } from "canvas";
import { validateURL } from "../functions.js";
const __dirname = import.meta.dirname;

export default class Clown {
  async getImage(image) {
    function drawImage(ctx, image, x, y, w, h, degrees) {
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((degrees * Math.PI) / 180.0);
      ctx.translate(-x - w / 2, -y - h / 2);
      ctx.drawImage(image, x, y, w, h);
      ctx.restore();
    }

    if (!image) throw new Error(`You must provide an image as an argument`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    const canvas = await createCanvas(610, 343);
    const ctx = canvas.getContext(`2d`);
    image = await loadImage(image);
    const background = await loadImage(`${__dirname}/../../assets/clown.png`);
    ctx.fillRect(0, 0, 610, 343);
    drawImage(ctx, image, 15, 55, 145, 130, -5);
    ctx.drawImage(background, 0, 0, 610, 343);
    return canvas.toBuffer("image/jpeg");
  }
}
