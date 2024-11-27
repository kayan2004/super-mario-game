class Hero extends Sprite {
  constructor(imagePath1, imagePath2) {
    super();

    // spritesheet
    this.player = new Image();
    this.player.src = imagePath1;
    this.playerl = new Image();
    this.playerl.src = imagePath2;
    this.currentSpriteSheet = this.player;

    //sounds
    this.jumpSmallSound = new Audio("../sounds/jump-small.wav");
    this.jumpBigSound = new Audio("../sounds/jump-super.wav");
    this.currentJumpSound = this.jumpSmallSound;
    this.jumpSoundPlayed = false;

    this.transformationSound = new Audio("../sounds/powerup.wav");
    this.transformationSoundPlayed = false;

    this.onObstacle = false;

    // dimensions
    this.width = 35;
    this.height = 35;

    // position
    this.GroundY = 437;
    this.x = 0;
    this.y = this.GroundY - this.height;

    // animation
    this.timePerFrame = 120;
    this.transformFrameIndex = 0;
    this.runningFrameIndex = 0;
    this.lastUpdate = Date.now();

    // animation dimensions
    this.sx = 80;
    this.sy = 32;
    this.spriteHeight = 16;
    this.spriteWidth = 16;

    // movement
    this.speed = 0;
    this.initialSpeed = 0.5;
    this.maxSpeed = 2;
    this.deceleration = 0.98;
    this.acceleration = 1.02;
    this.isRunning = false;
    this.direction = "right";

    // sliding
    this.isSliding = false;
    this.slidingFrames = 0;
    this.slidingDeceleration = 0.97;

    // type
    this.type = "small";

    // jumping
    this.vy = 0;
    this.gravity = 0.25;
    this.isJumping = false;
    this.jumpingHadEnded = false;
    this.jumpingDeceleration = 0.991;
    this.jumpingInitialSpeed = 0.1;

    // dying
    this.isDead = false;

    // climbing
    this.isClimbing = false;

    // states
    this.movement = "idle";
    this.jumping = false;

    // Collision flag
    this.isBlocked = false;

    this.slidingDirection = "right";

    // Original ground level
    this.originalGroundLevel = this.y;
    this.groundLevel = this.originalGroundLevel;
    this.previousObstacle = null;

    // transforming
    this.isTransforming = false;
    this.transformFrameIndex = 0;

    this.isFallingFromObstacle = false;
  }

  update(sprites, keys) {
    // console.log("groundLevel", this.groundLevel);
    console.log(this.type);
    if (this.type === "small") {
      this.currentJumpSound = this.jumpSmallSound;
    } else {
      this.currentJumpSound = this.jumpBigSound;
    }
    if (this.movement !== "sliding") {
      if (keys["ArrowRight"] || (keys["ArrowLeft"] && !this.isTransforming)) {
        this.movement = "running";
      } else if (this.movement !== "transforming") {
        this.movement = "idle";
      }
    }
    if (this.hasJustTookMushroom && this.type === "small") {
      this.movement = "transforming";
    }

    if (
      this.direction === "right" &&
      keys["ArrowLeft"] &&
      this.speed !== 0 &&
      this.movement !== "sliding"
    ) {
      this.movement = "sliding";
    } else if (
      this.direction === "left" &&
      this.speed !== 0 &&
      keys["ArrowRight"] &&
      this.movement !== "sliding"
    ) {
      this.movement = "sliding";
    }
    if (keys[" "]) {
      this.jumping = true;
    }

    if (this.jumping) {
      this.movement = "jumping";
    }

    switch (this.movement) {
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
      case "transforming":
        this.transform();
        break;
    }

    // console.log(this.movement);

    // 4. Apply movement based on speed and direction
    if (this.direction === "right") {
      this.x += this.speed;
    } else if (this.direction === "left") {
      this.x -= this.speed;
    }

    // 5. Keep hero within canvas bounds
    if (this.x <= 0) {
      this.x = 0;
    } else if (this.x >= canvas.width / 2 - this.width) {
      this.x = canvas.width / 2 - this.width;
    }
    this.animate();

    if (
      this.previousObstacle &&
      (this.x >= this.previousObstacle.x + this.previousObstacle.width ||
        this.x <= this.previousObstacle.x)
    ) {
      this.isFallingFromObstacle = true;
      this.groundLevel = this.originalGroundLevel;
      this.previousObstacle = null;
    }

    if (this.isFallingFromObstacle && !this.jumping) {
      console.log("Falling from obstacle");
      this.fall();
    }
  }

  handleVerticalPosition() {}
  transform() {
    this.speed = 0;
    this.y = this.GroundY - this.height;
    if (!this.transformationSoundPlayed) {
      this.transformationSound.play();
      this.transformationSoundPlayed = true;
    }
    this.animateTransform();
    switch (this.transformFrameIndex) {
      case 0 || 2:
        this.spriteHeight = 16;
        this.sx = 0;
        this.sy = 16;
        break;
      case 3:
        this.spriteHeight = 32;
        this.width = 35;
        this.height = 70;
        this.sx = 320;
        this.sy = 0;
        break;
      case 4:
        this.handleStateChange("big");
        this.hasJustTookMushroom = false;
        break;
      default:
    }
  }

  animateTransform() {
    if (Date.now() - this.lastUpdate >= this.timePerFrame) {
      this.transformFrameIndex = this.transformFrameIndex + 1;
      if (this.transformFrameIndex >= 4) {
        this.isTransforming = false;
        this.movement = "idle";
      }
      this.lastUpdate = Date.now();
    }
  }

  run(keys) {
    this.sx = 80 + this.spriteWidth + this.runningFrameIndex * this.spriteWidth;
    this.move(keys);
  }

  move(keys) {
    if (keys["ArrowRight"]) {
      this.direction = "right";
    } else if (keys["ArrowLeft"]) {
      this.direction = "left";
    }

    if (this.speed === 0) {
      this.speed = this.initialSpeed;
    }
    this.speed = Math.min(this.speed * this.acceleration, this.maxSpeed);

    if (this.direction === "right") {
      this.currentSpriteSheet = this.player;
    } else {
      this.currentSpriteSheet = this.playerl;
    }
  }

  idle() {
    if (this.speed > 0) {
      this.speed *= this.deceleration;
      this.sx =
        80 + this.spriteWidth + this.runningFrameIndex * this.spriteWidth;

      if (this.speed < this.initialSpeed) {
        this.speed = 0;
      }
    }
    if (this.speed === 0) {
      this.sx = 80;
    }

    if (this.direction === "right") {
      this.currentSpriteSheet = this.player;
    } else {
      this.currentSpriteSheet = this.playerl;
    }
  }

  slide() {
    if (this.speed > 0) {
      this.sx = 144;
      this.speed *= this.slidingDeceleration;

      if (this.speed < this.initialSpeed) {
        this.speed = 0;
        this.movement = "running";
      }
    }
    if (this.direction === "right") {
      this.currentSpriteSheet = this.playerl;
    } else {
      this.currentSpriteSheet = this.player;
    }
  }

  jump(keys) {
    this.sx = 160;
    if (!this.jumpSoundPlayed) {
      this.currentJumpSound.play();
      this.jumpSoundPlayed = true;
    }

    if (!this.isJumping) {
      this.vy = -8.5;
      this.isJumping = true;
    }

    if (this.jumping) {
      this.vy += this.gravity; // Adjust vy with gravity
      this.y += this.vy; // Move hero vertically
    }
    if (this.y >= this.groundLevel) {
      this.vy = 0;
      this.jumping = false;
      this.isJumping = false;
      this.movement = "idle";
      this.jumpSoundPlayed = false;
      this.y = this.groundLevel;
    }

    if (this.speed > 0) {
      this.speed *= this.jumpingDeceleration;

      if (this.speed < this.initialSpeed) {
        this.speed = 0;
      }
    }
  }

  fall() {
    console.log("Fall method called");
    console.log("Vertical velocity (vy):", this.vy);
    console.log("Current Y position:", this.y);
    console.log("Ground level:", this.groundLevel);

    // Increase the vertical velocity by gravity
    this.vy += this.gravity;
    // Update the hero's vertical position
    this.y += this.vy;

    // Optional: Add logic to stop falling when hitting the ground

    if (this.y > this.groundLevel) {
      console.log("Hit the ground");
      this.y = this.groundLevel;
      this.isFallingFromObstacle = false;
      this.vy = 0;
    }
  }

  handleStateChange(type) {
    console.log("handleStateChange", type);
    switch (type) {
      case "small":
        this.height = 35;
        this.width = 35;
        this.y = 437 - this.height;
        this.originalGroundLevel = this.y;
        this.groundLevel = this.y;
        this.stateHasChanged = true;
        this.sy = 32;
        this.spriteHeight = 16;
        this.type = "small";
        break;
      case "big":
        this.height = 70;
        this.width = 35;
        this.y = 437 - this.height;
        this.groundLevel = this.y;
        this.originalGroundLevel = this.y;
        this.stateHasChanged = false;

        this.sy = 0;
        this.spriteHeight = 32;
        this.type = "big";
        break;
      case "Fire":
        this.height = 70;
        this.width = 35;
        this.y = 437 - this.height;
        this.groundLevel = this.y;
        this.originalGroundLevel = this.y;
        this.stateHasChanged = false;
        this.sy = 96;
        this.spriteHeight = 32;
        this.type = "Fire";
        break;
    }
  }

  animate() {
    if (Date.now() - this.lastUpdate >= this.timePerFrame) {
      this.runningFrameIndex = (this.runningFrameIndex + 1) % 3;
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

  // animateClimbingFlag() {
  //   if (Date.now() - this.climbingLastUpdate >= this.timePerFrame) {
  //     this.climbingFrameIndex = (this.climbingFrameIndex + 1) % 2;
  //     this.climbingLastUpdate = Date.now();
  //   }
  // }

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

  handleCollision(obstacle) {
    // Calculate the center points
    let heroCenterX = this.x + this.width / 2;
    let heroCenterY = this.y + this.height / 2;
    let obstacleCenterX = obstacle.x + obstacle.width / 2;
    let obstacleCenterY = obstacle.y + obstacle.height / 2;

    // Calculate the distances between centers
    let deltaX = heroCenterX - obstacleCenterX;
    let deltaY = heroCenterY - obstacleCenterY;

    // Calculate overlap on both axes
    let overlapX = this.width / 2 + obstacle.width / 2 - Math.abs(deltaX);
    let overlapY = this.height / 2 + obstacle.height / 2 - Math.abs(deltaY);

    // Determine the side of collision
    if (overlapX > 0 && overlapY > 0) {
      if (overlapX < overlapY) {
        // Horizontal Collision
        if (deltaX > 0) {
          this.x = obstacle.x + obstacle.width;
        } else {
          this.x = obstacle.x - this.width;
        }
        this.speed = 0;
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

  handleLandingOnTop(obstacle) {
    console.log("Landed on top of obstacle");
    this.y = obstacle.y - this.height; // Ensure hero is placed on top
    this.groundLevel = obstacle.y - this.height;
    this.vy = 0;
    this.jumping = false;
  }

  handleHittingBottom(obstacle) {
    this.y = obstacle.y + obstacle.height;
    this.vy = 0;
    obstacle.isCollidedFromBelow = true;
  }
}
