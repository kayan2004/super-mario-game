class Obstacle extends Sprite {
  constructor(spritesheet, width, height, x, y) {
    super();
    // Image
    this.image = new Image();
    this.image.src = spritesheet;

    // Dimensions
    this.width = width;
    this.height = height;

    // Position
    this.x = x;
    this.y = y;

    // Collided from below flag
    this.isCollidedFromBelow = false;

    // Mark for removal flag
    this.markForRemoval = false;
  }

  update(sprites, keys) {
    // if marked for removal, remove it.
    if (this.markForRemoval) return true;

    // Find the hero sprite
    let hero = sprites.find((sprite) => sprite instanceof Hero);
    if (hero) {
      // If the hero collides with the obstacle, handle the collision in the hero class
      if (this.isCollided(hero)) {
        hero.handleCollision(this);
      }
      // If the hero is moving to the right, move the obstacle to the left
      if (hero.direction === "right") {
        this.x -= 2 * hero.speed;
      }
    }
  }

  /**
   * Checks if the hero has collided with the obstacle.
   * @param {Hero} hero - The hero sprite.
   * @returns {boolean} - True if the hero has collided with the obstacle, false otherwise.
   */
  isCollided(hero) {
    return (
      hero.x < this.x + this.width &&
      hero.x + hero.width > this.x &&
      hero.y < this.y + this.height &&
      hero.y + hero.height > this.y
    );
  }
}

class Block extends Obstacle {
  constructor(spritesheet, width, height, x, y) {
    super(spritesheet, width, height, x, y);

    // Sprite dimensions
    this.spriteWidth = 16;
    this.spriteHeight = 16;

    // Sound
    this.sound = new Audio("../sounds/breakblock.wav");
    this.soundPlayed = false;
  }

  update(sprites, keys) {
    // If the block is marked for removal, remove it.
    if (this.markForRemoval) return true;

    // Call the update method of the parent class (Obstacle)
    super.update(sprites, keys);

    // Find the hero sprite
    let hero = sprites.find((sprite) => sprite instanceof Hero);

    // Find the level generator sprite
    let levelGenerator = sprites.find(
      (sprite) => sprite instanceof LevelGenerator
    );
    // mario cannot break blocks when he is small
    if (hero.type === "small") {
      this.isCollidedFromBelow = false;
    }

    if (hero) {
      // If the block is collided from below by the hero and mario is big
      if (this.isCollidedFromBelow && hero.type === "big") {
        // Increase the score
        levelGenerator.updateScore(50);

        // Play the block breaking sound
        this.sound.play();

        // Return true to indicate the block should be removed
        return true;
      }
    }
  }

  /**
   * Draws the block on the canvas.
   *
   * @param {CanvasRenderingContext2D} ctx - The drawing context on the canvas.
   */
  draw(ctx) {
    ctx.drawImage(
      this.image, // Source image
      16, // Source x-coordinate
      0, // Source y-coordinate
      this.spriteWidth, // Source width
      this.spriteHeight, // Source height
      this.x, // Destination x-coordinate
      this.y, // Destination y-coordinate
      this.width, // Destination width
      this.height // Destination height
    );
  }
}

class SurpriseBlock extends Obstacle {
  constructor(spritesheet, width, height, x, y, type) {
    super(spritesheet, width, height, x, y);

    // Sprite dimensions
    this.spriteWidth = 16;
    this.spriteHeight = 16;

    // type can be: coin, mushroom
    this.type = type;

    // Animation
    this.timePerFrame = 400;
    this.frameIndex = 0;
    this.lastUpdate = Date.now();

    // Animation source coordinates
    this.sx = 384;
    this.sy = 0;

    // Flag to indicate if the block has become solid
    this.hasBecameSolid = false;
  }

  update(sprites, keys) {
    // If the block is marked for removal, return true to indicate it should be removed
    if (this.markForRemoval) return true;

    // Call the update method from the parent class
    super.update(sprites, keys);

    // If the block has already become solid, exit the update method
    if (this.hasBecameSolid) {
      return;
    }

    // Animate the block
    this.animate();

    // If the block is collided from below with the hero, handle the collision and mark the block as solid
    if (this.isCollidedFromBelow) {
      this.handleCollidedFromBottom(sprites);
      this.isCollidedFromBelow = false;
      this.hasBecameSolid = true;
    }
  }

  /**
   * Handles the collision of the surprise block from the bottom.
   *
   * This function is called when the block is hit from below by the hero.
   * It updates the frame index to show the block's new state, marks the block
   * as collided from below, and handles the type-specific behavior of the block.
   *
   * @param {Array} sprites - The array of sprites in the game.
   */
  handleCollidedFromBottom(sprites) {
    console.log("surprise block");
    this.frameIndex = 3;
    this.isCollidedFromBelow = true;
    this.handleType(sprites);
  }

  /**
   * Handles the type of the surprise block.
   *
   * @param {Array} sprites - The array of sprites in the game.
   */
  handleType(sprites) {
    // Switch statement to create the appropriate item based on the type of the surprise block upon hit.
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
          "../images/items.png",
          this.width,
          this.height,
          this.x,
          this.y - this.height
        );
        sprites.push(mushroom);
        break;
    }
  }

  /**
   * Draws the surprise block on the canvas.
   */
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

class Tube extends Obstacle {
  constructor(spritesheet, width, height, x, y, size) {
    super(spritesheet, width, height, x, y);

    // Size
    this.size = size;

    // Sprite dimensions
    this.spriteWidth = 32;
    this.spriteHeight = 16;

    // Scaler
    this.scaler = 844 / 401;

    // Sprite source coordinates
    this.sx = 0;
    this.sy = 128;
  }

  update(sprites, keys) {
    // If the tube is marked for removal, remove it
    if (this.markForRemoval) return true;

    // Call the update method from the parent class
    super.update(sprites, keys);

    // Get the enemies sprites
    let enemies = sprites.filter((sprite) => sprite instanceof Enemy);

    // Check collision for each enemy
    enemies.forEach((enemy) => {
      if (this.isCollided(enemy)) {
        enemy.handleCollisionWithTube();
      }
    });
  }

  /**
   * Draws the tube on the canvas.
   *
   * This function draws the top part of the tube and then draws the body of the tube
   * based on its size.
   */
  draw(ctx) {
    // Draw the top part of the tube
    ctx.drawImage(
      this.image, // Source image
      this.sx, // Source x-coordinate
      this.sy, // Source y-coordinate
      this.spriteWidth, // Source width
      this.spriteHeight, // Source height
      this.x, // Destination x-coordinate
      this.y, // Destination y-coordinate
      this.width, // Destination width
      this.height / this.size // Destination height
    );

    // Draw the body of the tube
    for (let i = 0; i < this.size; i++) {
      ctx.drawImage(
        this.image, // Source image
        this.sx, // Source x-coordinate
        this.sy + this.spriteHeight, // Source y-coordinate
        this.spriteWidth, // Source width
        this.spriteHeight, // Source height
        this.x, // Destination x-coordinate
        this.y + this.spriteHeight * this.scaler + i * this.spriteHeight, // Destination y-coordinate
        this.width, // Destination width
        this.spriteHeight * this.scaler // Destination height
      );
    }
  }
}

class GenerateObstacles extends Sprite {
  constructor(blockPositions, surpriseBlockPositions, tubePositions) {
    super();

    // Obstacles positions
    this.blockPositions = blockPositions;
    this.surpriseBlockPositions = surpriseBlockPositions;
    this.tubePositions = tubePositions;

    // Scaler
    this.scaler = 844 / 401;

    // Flag to indicate if the obstacles have been initialized
    this.isInitialized = false;
  }

  update(sprites, keys) {
    // If the sprite is marked for removal, remove it
    if (this.markForRemoval) return true;

    // If the obstacles have already been initialized, exit the update method
    if (this.isInitialized) return;

    // Initialize block sprites based on blockPositions
    this.blockPositions.forEach(([x, y]) => {
      let block = new Block(
        "../images/tiles.png",
        16 * this.scaler,
        16 * this.scaler,
        x * this.scaler,
        y * this.scaler
      );
      sprites.push(block);
    });

    // Initialize surprise block sprites based on surpriseBlockPositions
    this.surpriseBlockPositions.forEach(([x, y, type]) => {
      let surpriseBlock = new SurpriseBlock(
        "../images/tiles.png",
        16 * this.scaler,
        16 * this.scaler,
        x * this.scaler,
        y * this.scaler,
        type
      );
      sprites.push(surpriseBlock);
    });

    // Initialize tube sprites based on tubePositions
    this.tubePositions.forEach(([x, y, size]) => {
      let tube = new Tube(
        "../images/tiles.png",
        32 * this.scaler,
        16 * size * this.scaler,
        x * this.scaler,
        y * this.scaler,
        size
      );
      sprites.push(tube);
    });

    // Mark the obstacles as initialized
    this.isInitialized = true;
  }
}
