import { Jimp } from "jimp";
import { validateURL } from "../functions.js";
const __dirname = import.meta.dirname;

export default class Bed {
  async getImage(image1, image2) {
    if (!image1) return console.error(`You must provide an image as a first argument.`);
    let isValid1 = await validateURL(image1);
    if (!isValid1) return console.error(`You must provide a valid image URL or buffer.`);
    if (!image2) return console.error(`You must provide an image as a second argument.`);
    let isValid2 = await validateURL(image2);
    if (!isValid2) return console.error(`You must provide a valid image URL or buffer.`);
    let bg = await Jimp.read(`${__dirname}/../../assets/bed.png`);
    image1 = await Jimp.read(image1);
    image2 = await Jimp.read(image2);
    image1.circle();
    image2.circle();
    image1.resize({ w: 100, h: 100 });
    image2.resize({ w: 70, h: 70 });
    let image3 = image1.clone().resize({ w: 70, h: 70 });
    bg.composite(image1, 25, 100);
    bg.composite(image1, 25, 300);
    bg.composite(image3, 53, 450);
    bg.composite(image2, 53, 575);
    return await bg.getBuffer(`image/jpeg`);
  }
}
