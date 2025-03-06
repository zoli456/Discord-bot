const { Jimp } = require(`jimp`);
const { validateURL } = require(`../functions`);
module.exports = class Affect {
  async getImage(image) {
    if (!image) return console.error(`You must provide an image as a first argument.`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    let base = await Jimp.read(`${__dirname}/../../assets/affect.png`);
    let img = await Jimp.read(image);
    img.resize({ w: 200, h: 157 });
    base.composite(img, 180, 383);
    return await base.getBuffer(`image/jpeg`);
  }
};
