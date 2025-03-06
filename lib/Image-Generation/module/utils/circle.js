const { Jimp } = require(`jimp`);
const { validateURL } = require(`../functions`);
module.exports = class Circle {
  async getImage(image) {
    if (!image) return console.error(`You must provide an image as a first argument.`);
    let isValid = await validateURL(image);
    if (!isValid) return console.error(`You must provide a valid image URL or buffer.`);
    image = await Jimp.read(image);
    image.resize({ w: 480, h: 480 });
    image.circle();
    return await image.getBuffer(`image/jpeg`);
  }
};
