const { Jimp } = require("jimp");
const { validateURL } = require(`../functions`);
module.exports = class Bobross {
  async getImage(image1) {
    if (!image1)
      return console.error(`You must provide an image as an argument`);
    let isValid = await validateURL(image1);
    if (!isValid)
      return console.error(`You must provide a valid image URL or buffer.`);
    const base = await Jimp.read(`${__dirname}/../../assets/bobross.png`);
    const image1Buffer = await Jimp.read(image1);
    image1Buffer.resize({ w: 440, h: 440 });
    const compositeImage = new Jimp(
      {
        width: base.width,
        height: base.height,
      },
      0xffffffff,
    );
    compositeImage.composite(image1Buffer, 15, 20);
    compositeImage.composite(base, 0, 0);
    return await compositeImage.getBuffer(`image/jpeg`);
  }
};
