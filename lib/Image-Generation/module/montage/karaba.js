import { Jimp } from "jimp";
import { validateURL } from "../functions.js";
const __dirname = import.meta.dirname;

export default class Karaba {
  async getImage(image) {
    if (!image) return console.error(`You must provide an image as an argument`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    let bg = await Jimp.read(`${__dirname}/../../assets/karaba.png`);
    let img = await Jimp.read(image);
    const compositeImage = new Jimp({ width: bg.width, h: bg.height }, 0xffffffff);
    img.resize({ w: 130, h: 130 });
    bg.resize({ w: bg.getWidth(), h: bg.getHeight() });
    compositeImage.composite(img, 130, 44);
    compositeImage.composite(bg, 0, 0);
    return await compositeImage.getBuffer(`image/jpeg`);
  }
}
