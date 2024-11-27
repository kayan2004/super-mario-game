/*** This class should be temporary until I replace it with the tilemap (or i will make it appear as a blue background only)
 *
 */
class Background extends Sprite {
  constructor(imageSrc, width, height) {
    super();
    this.image = new Image();
    this.image.src = imageSrc;
    this.width = width;
    this.height = height;
    this.audio = new Audio("../sounds/aboveground_bgm.ogg");

    this.backgroundX = 0;
  }

  update(sprites, keys) {
    let hero = sprites.find((sprite) => sprite instanceof Hero);

    if (hero) {
      if (hero.direction === "right") {
        this.backgroundX += hero.speed;
      }

      if (this.backgroundX <= 0) {
        this.backgroundX = 0;
      } else if (this.backgroundX >= this.image.width - this.width) {
        this.backgroundX = this.image.width - this.width;
      }

      // this.audio.play();
    }
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.backgroundX,
      0,
      this.width,
      this.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    ctx.drawImage(
      this.image,
      this.backgroundX + canvas.width,
      0,
      this.width,
      this.height,
      canvas.width,
      0,
      canvas.width,
      canvas.height
    );
  }
}
