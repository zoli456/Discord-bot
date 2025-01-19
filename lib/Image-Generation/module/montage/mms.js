const { Jimp } = require(`jimp`);
const { validateURL } = require(`../functions`);
module.exports = class Mms {
  async getImage(image) {
    if (!image)
      return console.error(`You must provide an image as a first argument.`);
    let isValid = await validateURL(image);
    if (!isValid)
      return console.error(`You must provide a valid image URL or buffer.`);
    const bg = await Jimp.read(`${__dirname}/../../assets/mms.png`);
    const img = await Jimp.read(image);
    const canvas = new Jimp(400, 400);
    bg.resize({ w: 400, h: 400 });
    img.resize({ w: 270, h: 270 });
    canvas.composite(img, 60, 10);
    canvas.composite(bg, 0, 0);
    return await canvas.getBuffer(`image/jpeg`);
  }
};
