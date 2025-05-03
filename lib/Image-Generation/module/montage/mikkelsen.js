import { createCanvas, loadImage } from "canvas";
import { validateURL } from "../functions.js";
const __dirname = import.meta.dirname;

export default class Mikkelsen {
  async getImage(image) {
    if (!image) throw new Error(`You must provide an image as an argument`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    const canvas = await createCanvas(610, 955);
    const ctx = canvas.getContext(`2d`);
    image = await loadImage(image);
    const background = await loadImage(`${__dirname}/../../assets/mikkelsen.png`);
    ctx.drawImage(image, 20, 460, 580, 580);
    ctx.drawImage(background, 0, 0, 610, 955);
    return canvas.toBuffer("image/jpeg");
  }
}
