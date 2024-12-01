class Enemy extends Sprite {
  constructor(spritesheet, spritesheetr, x, y, width, height, speed) {
    super();
    this.markForRemoval = false;
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

    this.kickSound = new Audio("../sounds/kick.wav");
    this.kickSoundHasPlayed = false;
    this.timeBeforeRemovalAfterDeath = 1000;
    this.timeBeforeRemovalStartTime = null;
  }

  update(sprites, keys) {
    if (this.markForRemoval) {
      return true;
    }
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
  handleCollisionWithTube() {
    console.log("Enemy collided with tube");
    if (this.direction === "left") {
      this.direction = "right";
    } else {
      this.direction = "left";
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
  isJumpedOnBy(sprite) {
    return (
      this.isColliding(sprite) &&
      sprite.y + sprite.height <= this.y + this.height / 2
    );
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

    this.state = "alive";
  }

  update(sprites, keys) {
    if (this.markForRemoval) {
      return true;
    }
    super.update(sprites, keys);
    this.animate();

    switch (this.state) {
      case "alive":
        this.sx = this.frameIndex * this.spriteWidth;

        let hero = sprites.find((sprite) => sprite instanceof Hero);

        if (this.isJumpedOnBy(hero)) {
          this.state = "dead";
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
        break;
      case "dead":
        this.sx = 32;
        this.speed = 0;
        if (!this.hasPlayedDeathSound) {
          this.kickSound.play();
          this.hasPlayedDeathSound = true;
        }

        const currentTime = Date.now();
        if (!this.timeBeforeRemovalStartTime) {
          this.timeBeforeRemovalStartTime = currentTime;
        }
        if (
          currentTime - this.timeBeforeRemovalStartTime >=
          this.timeBeforeRemovalAfterDeath
        ) {
          return true;
        }
        break;
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
}

class Turtle extends Enemy {
  constructor(spritesheet, spritesheetr, x, y, width, height) {
    super(spritesheet, spritesheetr, x, y, width, height, 0.65);

    this.timePerFrame = 120;
    this.frameIndex = 0;
    this.lastUpdate = Date.now();
    this.sx = 96;
    this.sy = 0;
    this.spriteWidth = 16;
    this.spriteHeight = 32;

    this.state = "alive";
    this.isInvincible = false;
    this.invincibilityDuration = 1000;
    this.invincibilityStartTime = null;

    this.turtleCurrentTime = null;
    this.heroCurrentTime = null;
    this.crazyTime = 0;
  }

  update(sprites, keys) {
    super.update(sprites, keys);
    if (this.markForRemoval) {
      return true;
    }
    this.animate();

    let hero = sprites.find((sprite) => sprite instanceof Hero);
    this.turtleCurrentTime = Date.now();
    this.heroCurrentTime = Date.now();

    switch (this.state) {
      case "alive":
        this.sx = 96 + this.frameIndex * this.spriteWidth;

        if (this.isJumpedOnBy(hero)) {
          this.state = "frozen";
          this.isInvincible = true;
          this.invincibilityStartTime = this.turtleCurrentTime;
          this.kickSound.play();
        } else if (this.isColliding(hero)) {
          if (
            !hero.lastHitTime ||
            this.heroCurrentTime - hero.lastHitTime >= hero.hitCooldown
          ) {
            hero.hasJustBeenHit = true;
            hero.lastHitTime = this.heroCurrentTime;
          }
        }
        break;
      case "frozen":
        this.sx = 160;
        this.sy = 16;
        this.spriteHeight = 16;
        this.height = 35;
        this.y = 437 - this.height;
        this.speed = 0;

        if (
          this.turtleCurrentTime - this.invincibilityStartTime >=
          this.invincibilityDuration
        ) {
          this.isInvincible = false;
        }

        if (!this.isInvincible && this.isColliding(hero)) {
          this.kickSound.play();
          this.state = "crazy";
        }

        break;
      case "crazy":
        this.crazyTime++;
        this.sx = 160;
        this.sy = 16;
        this.spriteHeight = 16;
        this.height = 35;
        this.y = 437 - this.height;
        this.speed = 2;

        if (this.isJumpedOnBy(hero)) {
          this.state = "dead";
          this.kickSound.play();
        } else if (this.isColliding(hero) && this.crazyTime >= 120) {
          this.crazyTime = 0;
          if (
            !hero.lastHitTime ||
            this.heroCurrentTime - hero.lastHitTime >= hero.hitCooldown
          ) {
            hero.hasJustBeenHit = true;
            hero.lastHitTime = this.heroCurrentTime;
          }
        }

        break;
      case "dead":
        return true;
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
    if (this.direction === "left") {
      this.currentImage = this.image;
    } else {
      this.currentImage = this.imageR;
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
}

class GenerateEnemies extends Sprite {
  constructor(goombaPositions, turtlePositions) {
    super();

    this.goombaPositions = goombaPositions;
    this.turtlePositions = turtlePositions;

    this.scaler = 844 / 401;
    this.isInitialized = false;
  }

  update(sprites, keys) {
    if (this.markForRemoval) {
      return true;
    }
    // Loop through the array of positions to add new block sprites
    if (this.isInitialized) return;
    this.goombaPositions.forEach(([x, y]) => {
      let goomba = new Goomba(
        "../sprites/enemy.png",
        "../sprites/enemyr.png",
        x * this.scaler,
        y * this.scaler,
        16 * this.scaler,
        16 * this.scaler
      );
      sprites.push(goomba);
    });

    this.turtlePositions.forEach(([x, y]) => {
      let turtle = new Turtle(
        "../sprites/enemy.png",
        "../sprites/enemyr.png",
        x * this.scaler,
        y * this.scaler,
        16 * this.scaler,
        32 * this.scaler
      );
      sprites.push(turtle);
    });

    this.isInitialized = true;
  }
}
