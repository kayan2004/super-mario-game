class Collectable extends Sprite {
  constructor(spritesheet, width, height, x, y) {
    super();

    this.image = new Image();
    this.image.src = spritesheet;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;

    this.markForRemoval = false;
  }

  update(sprites, keys) {
    if (this.markForRemoval) return true;
    let hero = sprites.find((sprite) => sprite instanceof Hero);

    if (hero.direction === "right") {
      this.x -= 2 * hero.speed;
    }

    // if (hero) {
    //   if (this.isColliding(hero)) {
    //     return true;
    //   }
    // }
  }

  isColliding(sprite) {
    return (
      this.x < sprite.x + sprite.width &&
      this.x + this.width > sprite.x &&
      this.y < sprite.y + sprite.height &&
      this.y + this.height > sprite.y
    );
  }
}
class Coin extends Collectable {
  constructor(spritesheet, width, height, x, y) {
    super(spritesheet, width, height, x, y);

    // animation
    this.timePerFrame = 400;
    this.frameIndex = 0;
    this.lastUpdate = Date.now();

    this.sx = 384;
    this.sy = 16;
    this.spriteWidth = 16;
    this.spriteHeight = 16;

    this.sound = new Audio("../sounds/coin.wav");
    this.soundPlayed = false;
  }

  update(sprites, keys) {
    super.update(sprites, keys);

    let hero = sprites.find((sprite) => sprite instanceof Hero);

    if (hero && !this.soundPlayed) {
      this.sound.play();
      this.soundPlayed = true;
    }

    if (hero && hero.direction === "right" && hero.isRunning) {
      this.x -= 2 * hero.speed;
    }

    let levelGenerator = sprites.find(
      (sprite) => sprite instanceof LevelGenerator
    );

    if (this.soundPlayed && this.sound.currentTime >= this.sound.duration) {
      levelGenerator.score += 100;
      return true;
    }

    this.animate();
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.sx + this.spriteWidth * this.frameIndex,
      this.sy,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  animate() {
    if (Date.now() - this.lastUpdate >= this.timePerFrame) {
      this.frameIndex = (this.frameIndex + 1) % 3;
      this.lastUpdate = Date.now();
    }
  }

  isColliding(sprite) {
    return (
      this.x < sprite.x + sprite.width &&
      this.x + this.width > sprite.x &&
      this.y < sprite.y + sprite.height &&
      this.y + this.height > sprite.y
    );
  }
}

class Mushroom extends Collectable {
  constructor(spritesheet, width, height, x, y) {
    super(spritesheet, width, height, x, y);

    // animation
    // this.timePerFrame = 400;
    // this.frameIndex = 0;
    // this.lastUpdate = Date.now();

    this.sx = 0;
    this.sy = 0;
    this.spriteWidth = 16;
    this.spriteHeight = 16;
    this.speed = 0.5;

    this.vy = 0;
    this.gravity = 0.05;
    this.groundLevel = 437 - this.height;

    this.blockX;

    this.appearSound = new Audio("../sounds/itemAppear.wav");
    this.soundPlayed = false;
  }

  update(sprites, keys) {
    super.update(sprites, keys);

    if (this.markForRemoval) return true;

    if (!this.soundPlayed) {
      this.appearSound.play();
      this.soundPlayed = true;
    }
    let hero = sprites.find((sprite) => sprite instanceof Hero);

    this.x += this.speed;

    if (this.x > this.blockX - 4) {
      this.fall();
    }

    let levelGenerator = sprites.find(
      (sprite) => sprite instanceof LevelGenerator
    );
    if (this.isColliding(hero)) {
      if (hero.type === "small") {
        hero.hasJustTookMushroom = true;
      }
      levelGenerator.score += 500;
      return true;
    }

    if (this.x)
      if (hero) {
        if (hero.direction === "right" && hero.isRunning) {
          this.x -= 2 * hero.speed;
        }
      }

    this.animate();
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
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

  animate() {
    if (Date.now() - this.lastUpdate >= this.timePerFrame) {
      this.frameIndex = (this.frameIndex + 1) % 3;
      this.lastUpdate = Date.now();
    }
  }

  isColliding(sprite) {
    return (
      this.x < sprite.x + sprite.width &&
      this.x + this.width > sprite.x &&
      this.y < sprite.y + sprite.height &&
      this.y + this.height > sprite.y
    );
  }

  fall() {
    this.vy += this.gravity;
    this.y += this.vy;

    if (this.y > this.groundLevel) {
      this.y = this.groundLevel;
      this.vy = 0;
    }
  }
}
