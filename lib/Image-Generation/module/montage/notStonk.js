import { Jimp } from "jimp";
import { validateURL } from "../functions.js";
const __dirname = import.meta.dirname;

export default class NotStonk {
  async getImage(image) {
    if (!image) return console.error(`You must provide an image as an argument`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    const canvas = new Jimp(960, 576);
    const img1 = await Jimp.read(image);
    const background = await Jimp.read(`${__dirname}/../../assets/notStonk.png`);
    img1.resize({ w: 190, h: 190 });
    background.resize({ w: 960, h: 576 });
    canvas.composite(img1, 140, 5);
    canvas.composite(background, 0, 0);
    return await canvas.getBuffer(`image/jpeg`);
  }
}
