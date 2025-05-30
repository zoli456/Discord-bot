import { createCanvas, loadImage } from "canvas";
import { validateURL, applyText } from "../functions.js";
const __dirname = import.meta.dirname;

export default class Wanted {
  async getImage(image, currency = `$`) {
    if (!image) return console.error(`You must provide an image as a first argument.`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    if (typeof currency != `string`)
      return console.error(`You must provide a string for the currency.`);
    if (currency.length > 1)
      return console.error(`You must provide only one character for the currency.`);
    var price = Math.floor(Math.random() * 188708) + 329889;
    const canvas = await createCanvas(257, 383);
    const ctx = canvas.getContext(`2d`);
    const avatar = await loadImage(image);
    const background = await loadImage(`${__dirname}/../../assets/wanted.png`);
    ctx.drawImage(avatar, 25, 60, 210, 210);
    ctx.drawImage(background, 0, 0, 257, 383);
    ctx.textAlign = `center`;
    ctx.font = applyText(canvas, price.toLocaleString() + currency, 80, 200, `Times New Roman`);
    ctx.fillStyle = `#513d34`;
    ctx.fillText(price.toLocaleString() + currency, 128, 315);
    return canvas.toBuffer("image/jpeg");
  }
}
