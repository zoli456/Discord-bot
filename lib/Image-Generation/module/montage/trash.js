const { Jimp } = require(`jimp`);
const { validateURL } = require(`../functions`);
module.exports = class Trash {
  async getImage(image) {
    if (!image) return console.error(`You must provide an image as a first argument.`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    let bg = await Jimp.read(`${__dirname}/../../assets/trash.png`);
    image = await Jimp.read(image);
    image.resize({ w: 309, h: 309 });
    image.blur(5);
    bg.composite(image, 309, 0);
    return await bg.getBuffer(`image/jpeg`);
  }
};
