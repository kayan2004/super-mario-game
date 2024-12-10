class Hero extends Sprite {
  constructor(imagePath1, imagePath2) {
    super();

    // spritesheet
    this.player = new Image();
    this.player.src = imagePath1;
    this.playerl = new Image();
    this.playerl.src = imagePath2;
    this.currentSpriteSheet = this.player;

    // dimensions
    this.width = 35;
    this.height = 35;

    // position
    this.groundY = 437;
    this.x = 0;
    this.y = this.groundY - this.height;

    // animation
    this.timePerFrame = 120;
    this.transformSmallToBigFrameIndex = 0;
    this.runningFrameIndex = 0;
    this.lastUpdate = Date.now();

    // animation dimensions
    this.sx = 80;
    this.sy = 32;
    this.spriteHeight = 16;
    this.spriteWidth = 16;

    // state
    this.speed = 0;
    this.initialSpeed = 0.5;
    this.maxSpeed = 2;
    this.deceleration = 0.98;
    this.acceleration = 1.02;
    this.direction = "right";

    // sliding
    this.slidingDeceleration = 0.97;

    // type
    this.type = "small";

    // jumping
    this.vy = 0;
    this.gravity = 0.25;
    this.vyHasBeenSet = false;
    this.isJumpingDeceleration = 0.991;
    this.jumpSmallSound = new Audio("../sounds/jump-small.wav");
    this.jumpBigSound = new Audio("../sounds/jump-super.wav");
    this.currentJumpSound = this.jumpSmallSound;
    this.jumpSoundPlayed = false;

    // dying
    this.hasJustBeenHit = false;
    this.deathDuration = 1000;
    this.deathStartTime = null;
    this.deathSoundHasPlayed = false;
    this.deathSound = new Audio("../sounds/mariodie.wav");

    // states
    this.state = "idle";
    this.isJumping = false;

    // Ground level
    this.originalGroundLevel = this.groundY - this.height;
    this.groundLevel = this.originalGroundLevel;
    this.isFallingFromObstacle = false;
    this.previousObstacle = null;

    // transforming
    this.transformSmallToBigFrameIndex = 0;
    this.transformLastUpdate = Date.now();
    this.powerupSound = new Audio("../sounds/powerup.wav");
    this.powerdownSound = new Audio("../sounds/powerdown.wav");
    this.hasJustTookMushroom = false;

    // hit
    this.lastHitTime = null;
    this.hitCooldown = 4000;

    // level
    this.levelFinished = false;
    this.levelFinishedSound = new Audio("../sounds/stage_clear.wav");
  }

  update(sprites, keys) {
    // Check if the hero is marked for removal, if so, remove it.
    if (this.markForRemoval) return true;

    // Handle level completion
    if (this.levelFinished) {
      // Play the level completion sound
      this.levelFinishedSound.play();

      // Find the LevelGenerator sprite and increment its level
      let levelGenerator = sprites.find(
        (sprite) => sprite instanceof LevelGenerator
      );
      levelGenerator.level++;

      // Reset the levelFinished flag
      this.levelFinished = false;
      return;
    }

    // Ensure the hero's x position stays within the left canvas boundary
    if (this.x <= 0) {
      this.x = 0;
    }
    // Ensure the hero's x position doesn't exceed the middle of the canvas' width
    else if (this.x >= canvas.width / 2 - this.width) {
      this.x = canvas.width / 2 - this.width;
    }
    // this.animateRunning();

    // Move the hero based on the current direction and speed
    if (this.direction === "right") {
      this.x += this.speed;
    } else if (this.direction === "left") {
      this.x -= this.speed;
    }

    // Update the state if the hero is not sliding, transforming, or dying.
    if (
      this.state !== "sliding" &&
      this.state !== "transforming" &&
      this.state !== "dying"
    ) {
      // If the right or left arrow key is pressed, set the state to running.
      if (keys["ArrowRight"] || keys["ArrowLeft"]) {
        this.state = "running";
      }
      // If no arrow key is pressed, set the state to idle.
      else {
        this.state = "idle";
      }
    }

    // Check if the hero has just been hit
    if (this.hasJustBeenHit) {
      // If the hero is small, set the state to dying
      if (this.type === "small") {
        this.state = "dying";
      }
      // Otherwise, set the state to transforming
      else {
        this.state = "transforming";
      }
    }

    // Check if the hero should start sliding
    if (
      ((this.direction === "right" && keys["ArrowLeft"]) ||
        (this.direction === "left" && keys["ArrowRight"])) &&
      this.speed !== 0 &&
      this.state !== "transforming" &&
      this.state !== "dying"
    ) {
      this.state = "sliding";
    }

    // Check if the space key is pressed to initiate jumping
    if (keys[" "] && this.state !== "dying") {
      this.isJumping = true;
    }

    // If the hero is jumping, update the state to "jumping"
    if (this.isJumping) {
      this.state = "jumping";
    }

    // Check if the hero has just taken a mushroom and is currently small,
    // if so, set the state to transforming
    if (this.hasJustTookMushroom && this.type === "small") {
      this.state = "transforming";
    }

    // Check if the hero is falling from an obstacle
    if (
      this.previousObstacle &&
      (this.x >= this.previousObstacle.x + this.previousObstacle.width ||
        this.x <= this.previousObstacle.x)
    ) {
      this.isFallingFromObstacle = true;
      this.groundLevel = this.originalGroundLevel;
      this.previousObstacle = null;
    }

    // If the hero is falling from an obstacle and not jumping, call the fall method
    if (this.isFallingFromObstacle && !this.isJumping) {
      this.fall();
    }
    // Update the hero based on the current state
    switch (this.state) {
      case "transforming":
        this.transform();
        break;
      case "dying":
        this.die(sprites);
        break;
      case "idle":
        this.idle();
        break;
      case "running":
        this.run(keys);
        break;
      case "sliding":
        this.slide();
        break;
      case "jumping":
        this.jump(keys);
        break;
    }
  }

  /**
   * Transforms the hero's state between small and big.
   * If the hero is currently small, it will call the transformSmallToBig method.
   * If the hero is currently big, it will call the transformBigToSmall method.
   */
  transform() {
    if (this.type === "small") {
      this.transformSmallToBig();
    } else {
      this.transformBigToSmall();
    }
  }

  /**
   * Transforms the hero from big to small.
   * This method is called when the hero gets hit while in the big state.
   * It resets the hero's speed, sets the state to idle, plays the powerdown sound,
   * and handles the state change to small.
   */
  transformBigToSmall() {
    this.speed = 0;
    this.hasJustBeenHit = false;
    this.state = "idle";
    this.powerdownSound.play();
    this.handleTypeChange("small");
  }

  /**
   * Transforms the hero from small to big.
   * This method is called when the hero takes a mushroom while in the small state.
   * It resets the hero's speed, adjusts the hero's position, plays the powerup sound,
   * and animates the transformation.
   */
  transformSmallToBig() {
    // Animate the transformation
    this.animateTransformSmallToBig();

    // Reset the hero's speed to 0
    this.speed = 0;

    // Adjust the hero's y position to be on the grounda
    this.y = this.groundY - this.height;

    // Play the powerup sound
    this.powerupSound.play();

    // Handle the different frames of the transformation animation
    switch (this.transformSmallToBigFrameIndex) {
      case 0 || 2:
        this.spriteHeight = 16;
        this.sx = 0;
        this.sy = 16;
        break;
      case 1:
        // No changes for the second frame
        break;
      case 3:
        this.spriteHeight = 32;
        this.width = 35;
        this.height = 70;
        this.sx = 320;
        this.sy = 0;
        break;
      default:
        // Set the state to idle and handle the state change to big
        this.state = "idle";
        this.handleTypeChange("big");
        this.hasJustTookMushroom = false;
    }
  }

  /**
   * Handles the hero's death sequence.
   * Plays the death sound, updates the hero's position, and manages the death duration.
   * After the death duration, decreases the level generator's lives and resets the hero's state.
   *
   * @param {Array} sprites - The array of all sprites in the game.
   */
  die(sprites) {
    if (!this.deathStartTime) {
      this.deathStartTime = Date.now();
      this.deathDuration = this.deathSound.duration * 1000;
    }
    this.deathSound.play();

    this.speed = 0;

    // Simulate the hero falling down to death
    this.y += 2;

    // Set the sprite sheet to the death sprite
    this.sx = 176;
    this.sy = 32;

    // Check if the death duration has passed
    if (Date.now() - this.deathStartTime >= this.deathDuration) {
      // Find the level generator sprite and decrease its lives
      let levelGenerator = sprites.find(
        (sprite) => sprite instanceof LevelGenerator
      );
      levelGenerator.lives--;
      this.state = "idle";
      this.hasJustBeenHit = false;
      this.y = this.originalGroundLevel;
      this.deathStartTime = null;
    }
  }

  /**
   * Animates the transformation of the hero from small to big.
   * Updates the frame index based on the time per frame.
   * Resets the frame index if it exceeds the number of frames.
   */
  animateTransformSmallToBig() {
    if (Date.now() - this.transformLastUpdate >= this.timePerFrame) {
      this.transformSmallToBigFrameIndex++;
      if (this.transformSmallToBigFrameIndex >= 4) {
        this.transformSmallToBigFrameIndex = 0;
      }
      this.transformLastUpdate = Date.now();
    }
  }

  /**
   * Updates the hero's running state.
   * Sets the sprite sheet to the running sprite based on the direction.
   * Adjusts the hero's speed based on the acceleration and max speed.
   *
   * @param {Object} keys - The object containing the current state of the keys.
   */
  run(keys) {
    this.animateRunning();
    // Calculate the sprite's x-coordinate for the running animation
    this.sx = 80 + this.spriteWidth + this.runningFrameIndex * this.spriteWidth;

    // Set the direction based on key input
    if (keys["ArrowRight"]) {
      this.direction = "right";
    } else if (keys["ArrowLeft"]) {
      this.direction = "left";
    }

    // Initialize speed if it's zero
    if (this.speed === 0) {
      this.speed = this.initialSpeed;
    }

    // Update speed with acceleration, ensuring it doesn't exceed max speed
    this.speed = Math.min(this.speed * this.acceleration, this.maxSpeed);

    // Set the current sprite sheet based on the direction
    if (this.direction === "right") {
      this.currentSpriteSheet = this.player;
    } else {
      this.currentSpriteSheet = this.playerl;
    }
  }

  /**
   * Manages the hero's idle state.
   */
  idle() {
    // Apply deceleration to reduce speed if moving
    if (this.speed > 0) {
      this.animateRunning();
      this.speed *= this.deceleration;
      // Update sprite's x-coordinate for idle animation
      this.sx =
        80 + this.spriteWidth + this.runningFrameIndex * this.spriteWidth;

      // Set speed to zero if below initial speed
      if (this.speed < this.initialSpeed) {
        this.speed = 0;
      }
    }
    // Set sprite's x-coordinate to idle position if completely idle
    if (this.speed === 0) {
      this.sx = 80;
    }

    // Update sprite sheet based on direction
    if (this.direction === "right") {
      this.currentSpriteSheet = this.player;
    } else {
      this.currentSpriteSheet = this.playerl;
    }
  }
  /**
   * Manages the hero's sliding state.
   */
  slide() {
    // Check if the hero is moving
    if (this.speed > 0) {
      // Set the sprite's x-coordinate for sliding animation
      this.sx = 144;
      // Apply sliding deceleration to reduce speed
      this.speed *= this.slidingDeceleration;

      // If speed drops below initial speed, stop sliding and switch to running state
      if (this.speed < this.initialSpeed) {
        this.speed = 0;
        this.state = "running";
      }
    }
    // Update sprite sheet based on direction
    if (this.direction === "right") {
      this.currentSpriteSheet = this.playerl;
    } else {
      this.currentSpriteSheet = this.player;
    }
  }

  /**
   * Handles the hero's jump action.
   *
   * @param {Object} keys - The current state of input keys.
   *
   * This method manages the jump mechanics of the hero, including the
   * vertical velocity, jump sound, and state transitions. It also
   * applies deceleration to the hero's speed while jumping.
   */
  jump(keys) {
    // Set the sprite's x-coordinate for jumping animation
    this.sx = 160;

    // Play jump sound if it hasn't been played yet
    if (!this.jumpSoundPlayed) {
      this.currentJumpSound.play();
      this.jumpSoundPlayed = true;
    }

    // Initialize vertical velocity if not set
    if (!this.vyHasBeenSet) {
      this.vy = -8.5;
      this.vyHasBeenSet = true;
    }

    // Update vertical position and velocity
    if (this.isJumping) {
      this.vy += this.gravity;
      this.y += this.vy;
    }

    // Check if the hero has landed on the ground
    if (this.y >= this.groundLevel) {
      this.vy = 0;
      this.isJumping = false;
      this.vyHasBeenSet = false;
      this.jumpSoundPlayed = false;
      this.y = this.groundLevel;
      this.state = "idle";
    }

    // Apply deceleration to the hero's speed while jumping
    if (this.speed > 0) {
      this.speed *= this.isJumpingDeceleration;
    }

    // Ensure speed does not drop below initial speed
    if (this.speed < this.initialSpeed) {
      this.speed = 0;
    }
  }

  /**
   * Handles the falling mechanics of the hero.
   *
   * Updates the vertical position and velocity based on gravity.
   * Resets the hero's state when it hits the ground.
   */
  fall() {
    // Increase vertical velocity by gravity
    this.vy += this.gravity;

    // Update vertical position by vertical velocity
    this.y += this.vy;

    // Check if the hero has hit the ground
    if (this.y > this.groundLevel) {
      // Reset vertical position to ground level
      this.y = this.groundLevel;

      // Reset falling state
      this.isFallingFromObstacle = false;

      // Reset vertical velocity
      this.vy = 0;
    }
  }

  /**
   * Handles the type change of the hero character.
   *
   * This function updates the hero's attributes based on the type specified.
   * It adjusts the hero's dimensions, ground level, sprite settings, and jump sound.
   *
   * @param {string} type - The new type of the hero. Can be "small", "big", or "Fire".
   */
  handleTypeChange(type) {
    // Reset the mushroom state
    this.hasJustTookMushroom = false;
    this.type = type;
    // Switch between different hero types
    switch (type) {
      case "small":
        // Set attributes for small type
        this.currentJumpSound = this.jumpSmallSound;
        this.height = 35;
        this.width = 35;
        this.y = this.groundY - this.height;
        this.originalGroundLevel = this.y;
        this.groundLevel = this.y;
        this.sy = 32;
        this.spriteHeight = 16;
        break;
      case "big":
        // Set attributes for big type
        this.height = 70;
        this.width = 35;
        this.y = this.groundY - this.height;
        this.groundLevel = this.y;
        this.originalGroundLevel = this.y;
        this.currentJumpSound = this.jumpBigSound;
        this.sy = 0;
        this.spriteHeight = 32;
        break;
    }
  }

  /**
   * Animates the running state of the hero.
   *
   * Updates the frame index based on the time per frame.
   * Resets the frame index if it exceeds the number of frames.
   */
  animateRunning() {
    if (Date.now() - this.lastUpdate >= this.timePerFrame) {
      this.runningFrameIndex = (this.runningFrameIndex + 1) % 3;
      this.lastUpdate = Date.now();
    }
  }

  /**
   * Checks if the hero is colliding with a given sprite.
   *
   * This function determines if the hero's bounding box intersects with the bounding box of the provided sprite.
   *
   * @param {Object} sprite - The sprite to check for collision with.
   * @returns {boolean} - Returns true if the hero is colliding with the sprite, otherwise false.
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
   * Draws the hero on the canvas.
   *
   * @param {CanvasRenderingContext2D} ctx - The drawing context on the canvas.
   */
  draw(ctx) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      this.currentSpriteSheet,
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

  /**
   * Determines the side of collision between the hero and an obstacle.
   *
   * This function calculates the center points of both the hero and the obstacle,
   * then determines the overlap in both the x and y directions. Based on the
   * overlap, it identifies whether the collision is horizontal or vertical and
   * adjusts the hero's position accordingly.
   *
   * @param {Object} obstacle - The obstacle with which the hero is colliding.
   */
  handleCollision(obstacle) {
    // Calculate the center points of the hero and the obstacle
    let heroCenterX = this.x + this.width / 2;
    let heroCenterY = this.y + this.height / 2;
    let obstacleCenterX = obstacle.x + obstacle.width / 2;
    let obstacleCenterY = obstacle.y + obstacle.height / 2;

    // Calculate the differences in the x and y directions
    let deltaX = heroCenterX - obstacleCenterX;
    let deltaY = heroCenterY - obstacleCenterY;

    // Calculate the overlap in the x and y directions
    let overlapX = this.width / 2 + obstacle.width / 2 - Math.abs(deltaX);
    let overlapY = this.height / 2 + obstacle.height / 2 - Math.abs(deltaY);

    // Determine the side of collision
    if (overlapX > 0 && overlapY > 0) {
      if (overlapX < overlapY) {
        // Horizontal Collision
        if (deltaX > 0) {
          // Hero is colliding from the left side of the obstacle
          this.x = obstacle.x + obstacle.width;
        } else {
          // Hero is colliding from the right side of the obstacle
          this.x = obstacle.x - this.width;
        }
        this.speed = 0; // Stop the hero's horizontal movement
      } else {
        // Vertical Collision
        if (deltaY > 0) {
          // Hero is hitting the bottom of the obstacle
          this.handleHittingBottom(obstacle);
        } else {
          // Hero is on top of the obstacle
          this.previousObstacle = obstacle;
          this.handleLandingOnTop(obstacle);
        }
      }
    }
  }

  /**
   * Handles the hero landing on top of an obstacle.
   *
   * This function adjusts the hero's position to be on top of the obstacle,
   * updates the ground level, and resets the vertical velocity and jumping state.
   *
   * @param {Object} obstacle - The obstacle on which the hero has landed.
   */
  handleLandingOnTop(obstacle) {
    this.y = obstacle.y - this.height;
    this.groundLevel = obstacle.y - this.height;
    this.vy = 0;
    this.isJumping = false;
  }

  /**
   * Handles the hero hitting the bottom of an obstacle.
   *
   * This function adjusts the hero's position to be below the obstacle,
   * resets the vertical velocity, and marks the obstacle as collided from below.
   *
   * @param {Object} obstacle - The obstacle that the hero has hit from below.
   */
  handleHittingBottom(obstacle) {
    this.y = obstacle.y + obstacle.height;
    this.vy = 0;
    obstacle.isCollidedFromBelow = true;
  }

  makeInvincible() {
    // Check if the Enemy is colliding with the hero
    const currentTime = Date.now();
    // Check if the hero can be hit (based on cooldown)
    if (
      !this.lastHitTime ||
      currentTime - this.lastHitTime >= this.hitCooldown
    ) {
      this.hasJustBeenHit = true; // Mark the hero as just hit
      this.lastHitTime = currentTime; // Update the last hit time
    }
  }
}

class WinningArea extends Sprite {
  constructor(x, y, width, height) {
    super();

    // Position
    this.x = x;
    this.y = y;

    // Dimensions
    this.width = width;
    this.height = height;
  }

  update(sprites, keys) {
    // Check if the sprite is marked for removal
    if (this.markForRemoval) return true;

    // Find the hero sprite
    let hero = sprites.find((sprite) => sprite instanceof Hero);

    // Find the background sprite
    let background = sprites.find((sprite) => sprite instanceof Background);

    // Make the winning area appear to stay in place when hero moves
    if (hero.direction === "right") {
      this.x -= 2 * hero.speed;
    }

    // Check if the hero is colliding with the winning area
    if (this.isColliding(hero)) {
      hero.levelFinished = true; // Mark the level as finished for the hero
      background.stopAudio = true; // Stop the background audio
    }
  }

  /**
   * Checks if the winning area is colliding with a given sprite.
   *
   * This function determines if the winning area's bounding box intersects with the bounding box of the provided sprite.
   *
   * @param {Object} sprite - The sprite to check for collision with.
   * @returns {boolean} - Returns true if the winning area is colliding with the sprite, otherwise false.
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
   * Draws the winning area on the canvas.
   */
  draw(ctx) {
    ctx.fillStyle = "rgba(0, 255, 0, 0.5)"; // Semi-transparent green
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
