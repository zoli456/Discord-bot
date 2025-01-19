const { Jimp } = require("jimp");
const { validateURL } = require(`../functions`);
module.exports = class Jail {
  async getImage(image) {
    if (!image)
      return console.error(`You must provide an image as a first argument.`);
    let isValid = await validateURL(image);
    if (!isValid)
      return console.error(`You must provide a valid image URL or buffer.`);
    let bg = await Jimp.read(`${__dirname}/../../assets/jail.png`);
    let img = await Jimp.read(image);
    const compositeImage = new Jimp(400, 400, 0xffffffff);
    img.resize({ w: 400, h: 400 });
    bg.resize({ w: 400, h: 400 });
    compositeImage.composite(img, 0, 0);
    compositeImage.composite(bg, 0, 0);
    return await compositeImage.getBuffer(`image/jpeg`);
  }
};
