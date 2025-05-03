import { Jimp } from "jimp";
import { validateURL } from "../functions.js";
const __dirname = import.meta.dirname;

export default class ConfusedStonk {
  async getImage(image) {
    if (!image) return console.error(`You must provide an image as an argument`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    const image1 = await Jimp.read(image);
    const background = await Jimp.read(`${__dirname}/../../assets/confusedStonk.png`);
    image1.resize({ w: 400, h: 400 });
    const compositeImage = new Jimp(
      {
        width: background.width,
        height: background.height,
      },
      0xffffffff,
    );
    compositeImage.composite(image1, 190, 70);
    compositeImage.composite(background, 0, 0);
    return await compositeImage.getBuffer(`image/jpeg`);
  }
}
