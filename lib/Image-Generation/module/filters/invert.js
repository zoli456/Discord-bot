import { Jimp } from "jimp";
import { validateURL } from "../functions.js";

export default class Invert {
  async getImage(image) {
    if (!image) {
      console.error("You must provide an image as a first argument.");
      return;
    }

    const isValid = await validateURL(image);
    if (!isValid) {
      console.error("You must provide a valid image URL or buffer.");
      return;
    }

    const processedImage = await Jimp.read(image);
    processedImage.invert();
    return processedImage.getBuffer("image/jpeg");
  }
}
