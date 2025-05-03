import { Jimp } from "jimp";
import { validateURL } from "../functions.js";
const __dirname = import.meta.dirname;

export default class Ad {
  async getImage(image1) {
    if (!image1) return console.error(`You must provide an image as an argument`);
    let isValid = await validateURL(image1);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    const image1Buffer = await Jimp.read(image1);
    image1Buffer.resize({ w: 230, h: 230 });
    const background = await Jimp.read(`${__dirname}/../../assets/ad.png`);
    background.composite(image1Buffer, 150, 75);
    return await background.getBuffer("image/jpeg");
  }
}
