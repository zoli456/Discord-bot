import { validateURL } from "../functions.js";
import { Jimp } from "jimp";

export default class Blur {
  async getImage(image, level) {
    if (!image) return console.error(`You must provide an image as a first argument.`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    image = await Jimp.read(image);
    image.blur(isNaN(level) ? 5 : parseInt(level));
    return await image.getBuffer("image/jpeg");
  }
}
