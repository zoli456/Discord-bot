const { Jimp } = require(`jimp`);
const { validateURL } = require(`../functions`);
module.exports = class Mirror {
  async getImage(image, horizontal = true, vertical = false) {
    if (!image) return console.error(`You must provide an image as a first argument.`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    image = await Jimp.read(image);
    image.flip(horizontal, vertical);
    return await image.getBuffer(`image/jpeg`);
  }
};
