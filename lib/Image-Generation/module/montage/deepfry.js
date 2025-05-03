import { Jimp } from "jimp";
import { validateURL } from "../functions.js";
const __dirname = import.meta.dirname;

export default class Deepfry {
  async getImage(image) {
    if (!image) throw new Error(`You must provide an image as a first argument.`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    image = await Jimp.read(image);
    image.quality(2);
    image.contrast(1);
    image.pixelate(2);
    image.posterize(10);
    return await image.getBuffer(`image/jpeg`);
  }
}
