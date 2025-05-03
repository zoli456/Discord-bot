import { createCanvas, loadImage } from "canvas";
import { validateURL } from "../functions.js";

export default class Gay {
  async getImage(image) {
    if (!image) return console.error(`You must provide an image as a first argument.`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    let bg = await loadImage(`${__dirname}/../../assets/gay.png`);
    let img = await loadImage(image);
    const canvas = await createCanvas(480, 480);
    const ctx = canvas.getContext(`2d`);
    ctx.drawImage(img, 0, 0, 480, 480);
    ctx.drawImage(bg, 0, 0, 480, 480);
    return canvas.toBuffer("image/jpeg");
  }
}
