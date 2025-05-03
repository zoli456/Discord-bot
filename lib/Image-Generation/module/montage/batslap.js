import { Jimp } from "jimp";
import { validateURL } from "../functions.js";
const __dirname = import.meta.dirname;

export default class Batslap {
  async getImage(image1, image2) {
    if (!image1) return console.error(`You must provide an image as a first argument.`);
    let isValid1 = await validateURL(image1);
    if (!isValid1) return console.error(`You must provide a valid image URL or buffer.`);
    if (!image2) return console.error(`You must provide an image as a second argument.`);
    let isValid2 = await validateURL(image1);
    if (!isValid2) return console.error(`You must provide a valid image URL or buffer.`);
    let base = await Jimp.read(`${__dirname}/../../assets/batslap.png`);
    image1 = await Jimp.read(image1);
    image2 = await Jimp.read(image2);
    image1.circle();
    image2.circle();
    base.resize({ w: 1000, h: 500 });
    image1.resize({ w: 220, h: 220 });
    image2.resize({ w: 200, h: 200 });
    base.composite(image2, 580, 260);
    base.composite(image1, 350, 70);
    return await base.getBuffer(`image/jpeg`);
  }
}
