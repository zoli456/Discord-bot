const { Jimp } = require(`jimp`);
const { validateURL } = require(`../functions`);
module.exports = class Beautiful {
  async getImage(image) {
    if (!image) return console.error(`You must provide an image as a first argument.`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    let base = await Jimp.read(`${__dirname}/../../assets/beautiful.png`);
    base.resize({ w: 376, h: 400 });
    let img = await Jimp.read(image);
    img.resize({ w: 84, h: 95 });
    base.composite(img, 258, 28);
    base.composite(img, 258, 229);
    return await base.getBuffer(`image/jpeg`);
  }
};
