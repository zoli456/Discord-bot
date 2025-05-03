import { Jimp } from "jimp";
import { validateURL } from "../functions.js";
const __dirname = import.meta.dirname;

export default class DiscordBlack {
  async getImage(image) {
    if (!image) return console.error(`You must provide an image as an argument`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    const background = await Jimp.read(`${__dirname}/../../assets/discordblack.png`);
    const image1 = await Jimp.read(image);
    image1.resize({ w: background.width, h: background.height });
    const compositeImage = new Jimp(
      {
        width: background.width,
        height: background.height,
      },
      0xffffffff,
    );
    compositeImage.composite(image1, 0, 0);
    compositeImage.composite(background, 0, 0);
    return await compositeImage.getBuffer(`image/jpeg`);
  }
}
