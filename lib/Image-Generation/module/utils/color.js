import { createCanvas, loadImage } from 'canvas';

export default class Color {
  async getImage(color = `#FFFFFF`) {
    const canvas = await createCanvas(2048, 2048);
    const ctx = canvas.getContext(`2d`);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toBuffer("image/jpeg");
  }
};
