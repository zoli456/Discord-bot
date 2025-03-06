const { Jimp } = require(`jimp`);
const { validateURL } = require(`../functions`);
module.exports = class Kiss {
  async getImage(image1, image2) {
    if (!image1) return console.error(`You must provide an image as a first argument.`);
    let isValid1 = await validateURL(image1);
    if (!isValid1) return console.error(`You must provide a valid image URL or buffer.`);
    if (!image2) return console.error(`You must provide an image as a second argument.`);
    let isValid2 = await validateURL(image2);
    if (!isValid2) return console.error(`You must provide a valid image URL or buffer.`);
    let base = await Jimp.read(`${__dirname}/../../assets/kiss.png`);
    image1 = await Jimp.read(image1);
    image2 = await Jimp.read(image2);
    image1.circle();
    image2.circle();
    base.resize({ w: 768, h: 574 });
    image1.resize({ w: 200, h: 200 });
    image2.resize({ w: 200, h: 200 });
    base.composite(image1, 150, 25);
    base.composite(image2, 350, 25);
    return await base.getBuffer(`image/jpeg`);
  }
};
