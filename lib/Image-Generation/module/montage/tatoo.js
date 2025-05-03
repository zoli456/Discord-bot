import { createCanvas, loadImage } from "canvas";
import { validateURL } from "../functions.js";
const __dirname = import.meta.dirname;

export default class Tatoo {
  async getImage(image) {
    if (!image) return console.error(`You must provide an image as a first argument.`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    const canvas = await createCanvas(750, 1089);
    const ctx = canvas.getContext(`2d`);
    const avatar = await loadImage(image);
    const background = await loadImage(`${__dirname}/../../assets/tatoo.png`);
    ctx.drawImage(avatar, 145, 575, 400, 400);
    ctx.drawImage(background, 0, 0, 750, 1089);
    return canvas.toBuffer("image/jpeg");
  }
}
