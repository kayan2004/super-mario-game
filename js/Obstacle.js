class Obstacle extends Sprite {
  constructor(spritesheet, width, height, x, y) {
    super();
    this.image = new Image();
    this.image.src = spritesheet;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.spriteWidth = 16;
    this.spriteHeight = 16;

    this.isCollidedFromBelow = false;
    this.heroCollision = false;
  }

  update(sprites, keys) {
    let hero = sprites.find((sprite) => sprite instanceof Hero);
    if (hero) {
      if (this.checkCollision(hero)) {
        hero.handleCollision(this);
      }
      if (hero.direction === "right") {
        this.x -= 2 * hero.speed;
      }
    }

    if (this.isCollidedFromBelow) {
      return true;
    }
  }

  checkCollision(hero) {
    // Axis-Aligned Bounding Box (AABB) collision detection
    return (
      hero.x < this.x + this.width &&
      hero.x + hero.width > this.x &&
      hero.y < this.y + this.height &&
      hero.y + hero.height > this.y
    );
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      0,
      0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

class Block extends Obstacle {
  constructor(spritesheet, width, height, x, y) {
    super(spritesheet, width, height, x, y);

    this.sound = new Audio("../sounds/breakblock.wav");
    this.soundPlayed = false;
  }

  update(sprites, keys) {
    super.update(sprites, keys);
    let hero = sprites.find((sprite) => sprite instanceof Hero);
    let score = sprites.find((sprite) => sprite instanceof Score);

    if (hero) {
      if (hero.direction === "right" && hero.isRunning) {
        // this.x -= 2 * hero.speed;
      }

      if (this.isCollidedFromBelow) {
        score.score += 50;
        this.sound.play();
        return true;
      }
    }
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      16,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

class SurpriseBlock extends Obstacle {
  constructor(spritesheet, width, height, x, y, type) {
    super(spritesheet, width, height, x, y);

    // type can be: coin, mushroom or fire flower
    this.type = type;
    this.timePerFrame = 400;
    this.frameIndex = 0;
    this.lastUpdate = Date.now();

    this.sx = 384;
    this.sy = 0;

    this.hasBecameSolid = false;
  }

  update(sprites, keys) {
    super.update(sprites, keys);
    if (this.hasBecameSolid) {
      return;
    }

    this.animate();

    if (this.isCollidedFromBelow) {
      this.handleCollidedFromBottom(sprites);
      this.isCollidedFromBelow = false;
      this.hasBecameSolid = true;
    }
  }
  handleCollidedFromBottom(sprites) {
    console.log("surprise block");
    this.frameIndex = 3;
    this.isCollidedFromBelow = true;
    this.handleType(sprites);
  }

  handleType(sprites) {
    switch (this.type) {
      case "coin":
        let coin = new Coin(
          this.image.src,
          this.width,
          this.height,
          this.x,
          this.y - 50
        );
        sprites.push(coin);
        break;
      case "mushroom":
        let mushroom = new Mushroom(
          "../sprites/items.png",
          this.width,
          this.height,
          this.x,
          this.y - this.height
        );
        console.log(mushroom);
        sprites.push(mushroom);

        mushroom.blockX = this.x;
        break;
      case "fire flower":
        console.log("fire flower");
        break;
    }
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
}

class GenerateObstacles extends Sprite {
  constructor(blockPositions, surpriseBlockPositions) {
    super();

    this.blockPositions = blockPositions;
    this.surpriseBlockPositions = surpriseBlockPositions;

    this.scaler = 844 / 401;
    this.isInitialized = false;
  }

  update(sprites, keys) {
    // Loop through the array of positions to add new block sprites
    if (this.isInitialized) return;
    this.blockPositions.forEach(([x, y]) => {
      let block = new Block(
        "../sprites/tiles.png",
        16 * this.scaler,
        16 * this.scaler,
        x * this.scaler,
        y * this.scaler
      );
      sprites.push(block);
    });

    this.surpriseBlockPositions.forEach(([x, y, type]) => {
      let surpriseBlock = new SurpriseBlock(
        "../sprites/tiles.png",
        16 * this.scaler,
        16 * this.scaler,
        x * this.scaler,
        y * this.scaler,
        type
      );
      sprites.push(surpriseBlock);
    });

    this.isInitialized = true;
  }
}