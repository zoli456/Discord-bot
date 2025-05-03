import { Jimp } from "jimp";
import { validateURL } from "../functions.js";
const __dirname = import.meta.dirname;

export default class Delete {
  async getImage(image) {
    if (!image) return console.error(`You must provide an image as a first argument.`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    const background = await Jimp.read(`${__dirname}/../../assets/delete.png`);
    image = await Jimp.read(image);
    image.resize({ w: 195, h: 195 });
    background.composite(image, 120, 135);
    return await background.getBuffer(`image/jpeg`);
  }
}
