const { Jimp } = require(`jimp`);
const { validateURL } = require(`../functions`);
module.exports = class Spank {
  async getImage(image1, image2) {
    if (!image1) return console.error(`You must provide an image as a first argument.`);
    let isValid1 = await validateURL(image1);
    if (!isValid1) return console.error(`You must provide a valid image URL or buffer.`);
    if (!image2) return console.error(`You must provide an image as a second argument.`);
    let isValid2 = await validateURL(image2);
    if (!isValid2) return console.error(`You must provide a valid image URL or buffer.`);
    let bg = await Jimp.read(`${__dirname}/../../assets/spank.png`);
    image1 = await Jimp.read(image1);
    image2 = await Jimp.read(image2);
    image1.circle();
    image2.circle();
    image1.greyscale();
    image2.greyscale();
    bg.resize({ w: 500, h: 500 });
    image1.resize({ w: 140, h: 140 });
    image2.resize({ w: 120, h: 120 });
    bg.composite(image2, 350, 220);
    bg.composite(image1, 225, 5);
    return await bg.getBuffer(`image/jpeg`);
  }
};
