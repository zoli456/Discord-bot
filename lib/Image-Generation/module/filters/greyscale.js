const { Jimp } = require(`jimp`);
const { validateURL } = require(`../functions`);
module.exports = class Geryscale {
  async getImage(image) {
    if (!image) return console.error(`You must provide an image as a first argument.`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    image = await Jimp.read(image);
    image.greyscale();
    return await image.getBuffer(`image/jpeg`);
  }
};
