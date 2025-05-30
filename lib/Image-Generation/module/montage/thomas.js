import { createCanvas, loadImage } from "canvas";
import { validateURL } from "../functions.js";
const __dirname = import.meta.dirname;

export default class Thomas {
  async getImage(image) {
    if (!image) return console.error(`You must provide an image as a first argument.`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    const canvas = await createCanvas(841, 1058);
    const ctx = canvas.getContext(`2d`);
    const avatar = await loadImage(image);
    const background = await loadImage(`${__dirname}/../../assets/thomas.png`);
    ctx.drawImage(avatar, 220, 190, 400, 400);
    ctx.drawImage(background, 0, 0, 841, 1058);
    return canvas.toBuffer("image/jpeg");
  }
}
