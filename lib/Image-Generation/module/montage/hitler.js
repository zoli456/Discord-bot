const { Jimp } = require(`jimp`);
const { validateURL } = require(`../functions`);
module.exports = class Hitler {
  async getImage(image) {
    if (!image) return console.error(`You must provide an image as a first argument.`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    let bg = await Jimp.read(`${__dirname}/../../assets/hitler.png`);
    let img = await Jimp.read(image);
    img.resize({ w: 140, h: 140 });
    bg.composite(img, 46, 43);
    return await bg.getBuffer(`image/jpeg`);
  }
};
