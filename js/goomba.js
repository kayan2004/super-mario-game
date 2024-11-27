class Goomba extends Enemy {
  constructor(spritesheet, spritesheetr, x, y, width, height) {
    super();
    this.image = new Image();
    this.image.src = spritesheet;
    this.imageR = new Image();
    this.imageR.src = spritesheetr;
    this.currentImage = this.image;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = 437 - this.height;
    this.speed = 0.65;
    this.timePerFrame = 120;
    this.frameIndex = 0;
    this.lastUpdate = Date.now();
    this.sx = 0;
    this.sy = 16;
    this.spriteWidth = 16;
    this.spriteHeight = 16;

    this.direction = "left";
    this.timeBeforeRemovalAfterDeath = 20;
    this.timeBeforeRemovalCurrentFrame = 0;
  }

  update(sprites, keys) {
    if (this.isDead) {
      this.timeBeforeRemovalCurrentFrame++;
      if (
        this.timeBeforeRemovalCurrentFrame >= this.timeBeforeRemovalAfterDeath
      )
        return true;
      return;
    }

    let hero = sprites.find((sprite) => sprite instanceof Hero);

    if (!hero) {
      console.error("Hero not found in sprites");
      return;
    }

    this.animate();
    if (!this.isDead) {
      this.x -= this.speed + 2 * hero.speed;
    }

    if (this.isJumpedOnBy(hero)) {
      this.isDead = true;
    } else if (this.isColliding(hero)) {
      hero.isDead = true;
    }
  }

  animate() {
    if (Date.now() - this.lastUpdate >= this.timePerFrame) {
      this.frameIndex++;
      if (this.frameIndex >= 2) {
        this.frameIndex = 0;
      }
      this.lastUpdate = Date.now();
    }
  }

  draw(ctx) {
    if (this.isDead) {
      this.sx = 32;
    } else {
      this.sx = this.frameIndex * this.spriteWidth;
    }
    ctx.drawImage(
      this.currentImage,
      this.sx,
      this.sy,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  isColliding(sprite) {
    return (
      this.x < sprite.x + sprite.width &&
      this.x + this.width > sprite.x &&
      this.y < sprite.y + sprite.height &&
      this.y + this.height > sprite.y
    );
  }

  isJumpedOnBy(sprite) {
    return (
      this.isColliding(sprite) &&
      sprite.y + sprite.height <= this.y + this.height / 2
    );
  }
}
