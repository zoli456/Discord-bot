import { Jimp } from "jimp";
import { validateURL } from "../functions.js";
const __dirname = import.meta.dirname;

export default class Poutine {
  async getImage(image) {
    if (!image) return console.error(`You must provide an image as an argument`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    const background = await Jimp.read(`${__dirname}/../../assets/poutine.png`);
    const img1 = await Jimp.read(image);
    background.composite(img1, 350, 20);
    background.composite(background, 0, 0);
    return await background.getBuffer(`image/jpeg`);
  }
}
