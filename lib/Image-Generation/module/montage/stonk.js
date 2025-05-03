import { createCanvas, loadImage } from "canvas";
import { validateURL } from "../functions.js";
const __dirname = import.meta.dirname;

export default class Stonk {
  async getImage(image) {
    if (!image) return console.error(`You must provide an image as an argument`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    const canvas = await createCanvas(900, 539);
    const ctx = canvas.getContext(`2d`);
    image = await loadImage(image);
    const background = await loadImage(`${__dirname}/../../assets/stonk.png`);
    ctx.drawImage(image, 70, 40, 240, 240);
    ctx.drawImage(background, 0, 0, 900, 539);
    return canvas.toBuffer("image/jpeg");
  }
}
