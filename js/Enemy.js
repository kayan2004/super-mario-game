class Enemy extends Sprite {
  constructor(spritesheet, spritesheetr, x, y, width, height, speed) {
    super();
    this.markForRemoval = false;

    // Load the spritesheet
    this.image = new Image();
    this.image.src = spritesheet;
    this.imageR = new Image();
    this.imageR.src = spritesheetr;
    this.currentImage = this.image;

    // Dimensions
    this.width = width;
    this.height = height;

    // Position
    this.x = x;
    this.groundY = 437;
    this.y = this.groundY - this.height;

    // Movement
    this.direction = "left";
    this.speed = speed;

    // Death
    this.kickSound = new Audio("../sounds/kick.wav");
    this.kickSoundHasPlayed = false;
    this.timeBeforeRemovalAfterDeath = 1000;
    this.timeBeforeRemovalStartTime = null;
  }

  update(sprites, keys) {
    // Check if the enemy is marked for removal
    if (this.markForRemoval) {
      return true;
    }

    // Find the hero sprite
    let hero = sprites.find((sprite) => sprite instanceof Hero);

    // Move the enemy based on its direction
    if (this.direction === "left") {
      this.x -= this.speed; // Move left
    } else {
      this.x += this.speed; // Move right
    }

    // Adjust the enemy's position to make it stay in place when the hero moves right
    if (hero.direction === "right") {
      this.x -= 2 * hero.speed;
    }
  }

  /**
   * Handles the collision of the enemy with a tube.
   * When the enemy collides with a tube, it changes its direction.
   * If the enemy is moving left, it will change direction to right.
   * If the enemy is moving right, it will change direction to left.
   */
  handleCollisionWithTube() {
    console.log("Enemy collided with tube");
    if (this.direction === "left") {
      this.direction = "right";
    } else {
      this.direction = "left";
    }
  }

  /**
   * Checks if the enemy is colliding with another sprite.
   *
   * @param {Sprite} sprite - The sprite to check collision with.
   * @returns {boolean} - Returns true if the enemy is colliding with the sprite, false otherwise.
   */
  isColliding(sprite) {
    return (
      this.x < sprite.x + sprite.width &&
      this.x + this.width > sprite.x &&
      this.y < sprite.y + sprite.height &&
      this.y + this.height > sprite.y
    );
  }

  /**
   * Checks if the enemy is jumped on by another sprite.
   *
   * @param {Sprite} sprite - The sprite to check if it jumped on the enemy.
   * @returns {boolean} - Returns true if the sprite jumped on the enemy, false otherwise.
   */
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

    // Animation
    this.timePerFrame = 120;
    this.frameIndex = 0;
    this.lastUpdate = Date.now();
    this.sx = 0;
    this.sy = 16;
    this.spriteWidth = 16;
    this.spriteHeight = 16;

    // State
    this.state = "alive";

    // Add currentTime as a data field
    this.currentTime = null;
  }

  update(sprites, keys) {
    // Check if the Goomba is marked for removal
    if (this.markForRemoval) {
      return true;
    }

    // Call the update method from the parent class (Enemy)
    super.update(sprites, keys);

    // Update currentTime
    this.currentTime = Date.now();

    // Animate the Goomba's sprite
    this.animate();

    let levelGenerator = sprites.find(
      (sprite) => sprite instanceof LevelGenerator
    );
    // Handle the Goomba's behavior based on its current state
    switch (this.state) {
      case "alive":
        // Update the sprite's x-coordinate for animation
        this.sx = this.frameIndex * this.spriteWidth;

        // Find the hero sprite in the list of sprites
        let hero = sprites.find((sprite) => sprite instanceof Hero);

        // Find the level generator sprite

        // Check if the hero has jumped on the Goomba
        if (this.isJumpedOnBy(hero)) {
          this.state = "dead"; // Change state to dead if jumped on
        } else if (this.isColliding(hero)) {
          hero.makeInvincible();
        }
        break;
      case "dead":
        // Set the sprite's x-coordinate for the dead frame
        this.sx = 32;
        this.speed = 0; // Stop the Goomba's movement

        // Play the death sound if it hasn't been played yet
        if (!this.hasPlayedDeathSound) {
          this.kickSound.play();
          this.hasPlayedDeathSound = true;
        }

        const currentTime = Date.now();
        // Record the start time for removal if not already set
        if (!this.timeBeforeRemovalStartTime) {
          this.timeBeforeRemovalStartTime = currentTime;
        }
        // Check if enough time has passed to remove the Goomba
        if (
          currentTime - this.timeBeforeRemovalStartTime >=
          this.timeBeforeRemovalAfterDeath
        ) {
          levelGenerator.updateScore(200); // Update the score once before removal
          return true; // Indicate that the Goomba should be removed
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
    super(spritesheet, spritesheetr, x, y, width, height, 0.8);

    // Animation
    this.timePerFrame = 120;
    this.frameIndex = 0;
    this.lastUpdate = Date.now();

    // Sprite coordinates
    this.sx = 96;
    this.sy = 0;
    this.spriteWidth = 16;
    this.spriteHeight = 32;

    // States
    this.state = "alive";
    this.isInvincible = false;
    this.invincibilityDuration = 1500;
    this.invincibilityStartTime = null;
    this.turtleCurrentTime = null;
    this.crazyTime = 0;
  }

  update(sprites, keys) {
    // Call the update method from the parent class (Enemy) to handle basic updates
    super.update(sprites, keys);

    // Check if the Turtle is marked for removal
    if (this.markForRemoval) {
      return true; // Indicate that the Turtle should be removed
    }

    // Animate the Turtle's sprite
    this.animate();

    // Find the hero sprite in the list of sprites
    let hero = sprites.find((sprite) => sprite instanceof Hero);

    // Update the current time for the Turtle
    this.turtleCurrentTime = Date.now();

    // Find the level generator sprite
    let levelGenerator = sprites.find(
      (sprite) => sprite instanceof LevelGenerator
    );

    // Handle the Turtle's behavior based on its current state
    switch (this.state) {
      case "alive":
        // Update the sprite's x-coordinate for animation
        this.sx = 96 + this.frameIndex * this.spriteWidth;

        // Check if the hero has jumped on the Turtle
        if (this.isJumpedOnBy(hero)) {
          this.state = "frozen"; // Change state to frozen if jumped on
          this.isInvincible = true; // Make the Turtle invincible
          this.invincibilityStartTime = this.turtleCurrentTime; // Record the start time of invincibility
          this.kickSound.play(); // Play sound
        } else if (this.isColliding(hero)) {
          hero.makeInvincible(); // Make the hero invincible after losing a life
        }
        break;
      case "frozen":
        // Set the sprite's coordinates and dimensions for the frozen state
        this.sx = 160;
        this.sy = 16;
        this.spriteHeight = 16;
        this.height = 35;
        this.y = 437 - this.height;

        this.speed = 0; // Stop the Turtle's movement

        // Check if the Turtle's invincibility duration has passed
        if (
          this.turtleCurrentTime - this.invincibilityStartTime >=
          this.invincibilityDuration
        ) {
          this.isInvincible = false; // End invincibility
        }

        // Check if the Turtle is colliding with the hero and is not invincible
        if (!this.isInvincible && this.isColliding(hero)) {
          this.kickSound.play(); // Play sound
          this.state = "crazy"; // Change state to crazy
        }

        break;
      case "crazy":
        // Increment the crazy time counter
        this.crazyTime++;
        // Set the sprite's coordinates and dimensions for the crazy state
        this.sx = 160;
        this.sy = 16;
        this.spriteHeight = 16;
        this.height = 35;
        this.y = 437 - this.height;
        this.speed = 2.5; // Increase the Turtle's speed

        // Check if the hero has jumped on the Turtle
        if (this.isJumpedOnBy(hero)) {
          this.state = "dead"; // Change state to dead if jumped on
          this.kickSound.play(); // Play the kick sound
        } else if (this.isColliding(hero) && this.crazyTime >= 120) {
          this.crazyTime = 0; // Reset the crazy time counter
          hero.makeInvincible(); // Make the hero invincible if colliding
        }

        break;
      case "dead":
        levelGenerator.updateScore(400); // Update the score once before removal
        return true; // Remove the Turtle
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

    // Enemy positions
    this.goombaPositions = goombaPositions;
    this.turtlePositions = turtlePositions;

    // Scaler
    this.scaler = 844 / 401;

    // Initialization flag
    this.isInitialized = false;
  }

  update(sprites, keys) {
    // Check if the sprite is marked for removal
    if (this.markForRemoval) {
      return true;
    }

    // Check if the sprite have already been initialized
    if (this.isInitialized) return;

    // Initialize Goomba sprites based on their positions
    this.goombaPositions.forEach(([x, y]) => {
      let goomba = new Goomba(
        "../images/enemy.png",
        "../images/enemyr.png",
        x * this.scaler,
        y * this.scaler,
        16 * this.scaler,
        16 * this.scaler
      );
      sprites.push(goomba);
    });

    // Initialize Turtle sprites based on their positions
    this.turtlePositions.forEach(([x, y]) => {
      let turtle = new Turtle(
        "../images/enemy.png",
        "../images/enemyr.png",
        x * this.scaler,
        y * this.scaler,
        16 * this.scaler,
        32 * this.scaler
      );
      sprites.push(turtle);
    });

    // Mark as initialized
    this.isInitialized = true;
  }
}
