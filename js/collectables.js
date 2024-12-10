class Collectable extends Sprite {
  constructor(spritesheet, width, height, x, y) {
    super();

    // Spritesheet
    this.image = new Image();
    this.image.src = spritesheet;

    // Dimensions
    this.width = width;
    this.height = height;

    // Coordinates
    this.x = x;
    this.y = y;

    // Removal flag
    this.markForRemoval = false;
  }

  update(sprites, keys) {
    // Check if the sprite is marked for removal
    if (this.markForRemoval) return true;

    // Find the hero sprite
    let hero = sprites.find((sprite) => sprite instanceof Hero);

    // Make the collectable stay in place if the hero is moving right
    if (hero.direction === "right") {
      this.x -= 2 * hero.speed;
    }
  }

  /**
   * Checks if the collectable is colliding with another sprite.
   *
   * This function determines if the bounding box of the collectable
   * intersects with the bounding box of the provided sprite.
   *
   * @param {Sprite} sprite - The sprite to check for collision with.
   * @returns {boolean} - Returns true if the collectable is colliding with the sprite, otherwise false.
   */
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

    // Animation coordinates
    this.sx = 384;
    this.sy = 16;
    this.spriteWidth = 16;
    this.spriteHeight = 16;

    // Sound
    this.sound = new Audio("../sounds/coin.wav");
    this.soundPlayed = false;
  }

  update(sprites, keys) {
    // Call the update method from the parent class (Collectable)
    super.update(sprites, keys);

    // Find the hero sprite
    let hero = sprites.find((sprite) => sprite instanceof Hero);

    // Play the coin sound once
    if (hero && !this.soundPlayed) {
      this.sound.play();
      this.soundPlayed = true;
    }

    // Find the level generator sprite
    let levelGenerator = sprites.find(
      (sprite) => sprite instanceof LevelGenerator
    );

    // Increase the score and mark the coin for removal if the sound has finished playing
    if (this.soundPlayed && this.sound.currentTime >= this.sound.duration) {
      levelGenerator.updateScore(100);
      return true; // Indicate that the coin should be removed
    }

    // Animate the coin's sprite
    this.animate();
  }

  /**
   * Draws the coin on the canvas.
   */
  draw(ctx) {
    ctx.drawImage(
      this.image, // The image to draw
      this.sx + this.spriteWidth * this.frameIndex, // The x-coordinate of the source image
      this.sy, // The y-coordinate of the source image
      this.spriteWidth, // The width of the source image
      this.spriteHeight, // The height of the source image
      this.x, // The x-coordinate on the canvas
      this.y, // The y-coordinate on the canvas
      this.width, // The width to draw the image on the canvas
      this.height // The height to draw the image on the canvas
    );
  }

  /**
   * Animates the coin by updating the frame index based on the time per frame.
   */
  animate() {
    if (Date.now() - this.lastUpdate >= this.timePerFrame) {
      this.frameIndex = (this.frameIndex + 1) % 3;
      this.lastUpdate = Date.now();
    }
  }
}

class Mushroom extends Collectable {
  constructor(spritesheet, width, height, x, y) {
    super(spritesheet, width, height, x, y);

    // animation
    this.timePerFrame = 400;
    this.frameIndex = 0;
    this.lastUpdate = Date.now();

    // Animation coordinates
    this.sx = 0;
    this.sy = 0;
    this.spriteWidth = 16;
    this.spriteHeight = 16;

    // Speed
    this.speed = 0.5;

    // Vertical movement
    this.vy = 0;
    this.gravity = 0.05;
    this.groundLevel = 437 - this.height;

    this.blockX;
    // Falling
    this.fallingTime = 1000;
    this.timeBeforeFalling = 0;
    this.timeSinceFalling = 0;

    // Sound
    this.appearSound = new Audio("../sounds/itemAppear.wav");
    this.soundPlayed = false;
  }

  update(sprites, keys) {
    // Check if the Mushroom is marked for removal
    if (this.markForRemoval) return true;

    // Call the update method from the parent class (Collectable)
    super.update(sprites, keys);

    // Animate the Mushroom's sprite
    this.animate();

    // Play the appear sound once
    if (!this.soundPlayed) {
      this.appearSound.play();
      this.soundPlayed = true;
    }

    // Find the hero sprite
    let hero = sprites.find((sprite) => sprite instanceof Hero);

    // Move the Mushroom down the screen
    this.x += this.speed;

    // Set the time since falling to the current time
    if (this.timeSinceFalling === 0) {
      this.timeSinceFalling = Date.now();
    }

    // Make the Mushroom fall after a certain amount of time
    if (Date.now() - this.timeSinceFalling >= this.fallingTime) {
      this.fall();
    }

    // Find the level generator sprite
    let levelGenerator = sprites.find(
      (sprite) => sprite instanceof LevelGenerator
    );

    // Check if the Mushroom is colliding with the hero
    if (this.isColliding(hero)) {
      // If the hero is small, mark that it has taken a mushroom
      if (hero.type === "small") {
        hero.hasJustTookMushroom = true;
      }
      // Increase the score
      levelGenerator.updateScore(500);
      return true; // Remove the Mushroom
    }
  }

  /**
   * Draws the Mushroom on the canvas.
   */
  draw(ctx) {
    ctx.drawImage(
      this.image, // The image to draw
      this.sx, // The x-coordinate of the source image
      this.sy, // The y-coordinate of the source image
      this.spriteWidth, // The width of the source image
      this.spriteHeight, // The height of the source image
      this.x, // The x-coordinate on the canvas
      this.y, // The y-coordinate on the canvas
      this.width, // The width to draw the image on the canvas
      this.height // The height to draw the image on the canvas
    );
  }

  /**
   * Animates the Mushroom by updating the frame index based on the time per frame.
   */
  animate() {
    if (Date.now() - this.lastUpdate >= this.timePerFrame) {
      this.frameIndex = (this.frameIndex + 1) % 3;
      this.lastUpdate = Date.now();
    }
  }

  /**
   * Makes the Mushroom fall by applying gravity and updating its vertical position.
   */
  fall() {
    // Apply gravity to the vertical velocity
    this.vy += this.gravity;
    // Update the vertical position
    this.y += this.vy;

    // If the Mushroom is below the ground level, reset its position and vertical velocity
    if (this.y > this.groundLevel) {
      this.y = this.groundLevel;
      this.vy = 0;
    }
  }
}
