class Enemy extends Sprite {
  constructor(spritesheet, spritesheetr, x, y, width, height, speed) {
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
    this.direction = "left";
    this.speed = speed;

    this.deathSound = new Audio("../sounds/kick.wav");
    this.deathSoundHasPlayed = false;
  }

  handleCollisionWithTube() {
    console.log("Enemy collided with tube");
    if (this.direction === "left") {
      this.direction = "right";
    } else {
      this.direction = "left";
    }
  }

  update(sprites, keys) {
    let hero = sprites.find((sprite) => sprite instanceof Hero);

    if (this.direction === "left") {
      this.x -= this.speed;
    } else {
      this.x += this.speed;
    }
    if (hero.direction === "right") {
      this.x -= 2 * hero.speed;
    }
  }
}

class Goomba extends Enemy {
  constructor(spritesheet, spritesheetr, x, y, width, height) {
    super(spritesheet, spritesheetr, x, y, width, height, 0.65);

    this.timePerFrame = 120;
    this.frameIndex = 0;
    this.lastUpdate = Date.now();
    this.sx = 0;
    this.sy = 16;
    this.spriteWidth = 16;
    this.spriteHeight = 16;

    this.timeBeforeRemovalAfterDeath = 20;
    this.timeBeforeRemovalCurrentFrame = 0;
  }

  update(sprites, keys) {
    super.update(sprites, keys);
    if (this.isDead) {
      this.timeBeforeRemovalCurrentFrame++;
      if (
        this.timeBeforeRemovalCurrentFrame >= this.timeBeforeRemovalAfterDeath
      )
        return true;
      return;
    }

    let hero = sprites.find((sprite) => sprite instanceof Hero);

    this.animate();

    if (this.isJumpedOnBy(hero)) {
      if (!this.deathSoundHasPlayed) {
        this.deathSound.play();
        this.deathSoundHasPlayed = true;
      }
      this.isDead = true;
    } else if (this.isColliding(hero)) {
      const currentTime = Date.now();
      if (
        !hero.lastHitTime ||
        currentTime - hero.lastHitTime >= hero.hitCooldown
      ) {
        hero.hasJustBeenHit = true;
        hero.lastHitTime = currentTime;
      }
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
