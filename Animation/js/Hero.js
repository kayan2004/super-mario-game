class Hero extends Sprite {
  constructor(imagePath, x, y, width, height, timePerFrame, numberOfFrames) {
    super();
    this.spritesheet = new Image();
    this.spritesheet.src = imagePath;
    this.x = x;
    this.width = width;
    this.height = height;
    this.y = y;
    this.timePerFrame = timePerFrame;
    this.numberOfFrames = numberOfFrames || 1;
    this.frameIndex = 0;
    this.climbingFrameIndex = 0;
    this.lastUpdate = Date.now();
    this.climbingLastUpdate = Date.now();
    this.speed = 0.5;
    this.isMoving = false;
    this.direction = "right";
    this.transitionDelay = 0;
    this.transitionFrameCount = 10;
    this.isTransitioning = false;
    this.transitionFrames = 0;
    this.state = "small";
    this.hasChangedToBig = false;

    this.vy = 0;
    this.gravity = 0.25;
    this.isJumping = false;
    this.groundLevel = y;
    this.isDead = false;
    this.isClimbing = false;
  }

  // Function to remove a specific background color from ImageData
  /**
   * Removes a specific background color from an ImageData object by making matching pixels transparent
   * @param {ImageData} imageData - The ImageData object to process
   * @param {Object} color - An object containing r,g,b values of the color to remove
   * @param {number} color.r - Red component (0-255)
   * @param {number} color.g - Green component (0-255)
   * @param {number} color.b - Blue component (0-255)
   * @returns {ImageData} The modified ImageData with matching pixels made transparent
   */
  removeBackgroundColor(imageData, color) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (r === color.r && g === color.g && b === color.b) {
        data[i + 3] = 0; // Set alpha to 0 (transparent)
      }
    }
    return imageData;
  }

  update(sprites, keys) {
    this.handleStateChange();

    // handle climbing flag
    if (this.x >= 500) {
      this.isClimbing = true;
      this.isMoving = false;
    }
    if (this.isClimbing) {
      this.animateClimbingFlag();
    } else {
      if (
        keys["ArrowLeft"] &&
        this.direction === "right" &&
        !this.isTransitioning
      ) {
        this.startTransition("left");
      } else if (
        keys["ArrowRight"] &&
        this.direction === "left" &&
        !this.isTransitioning
      ) {
        this.startTransition("right");
      }

      if (!this.isTransitioning) {
        if (keys["ArrowRight"]) {
          this.x += this.speed;
          this.speed = Math.min(this.speed * 1.02, 5);
          this.isMoving = true;
        } else if (keys["ArrowLeft"]) {
          this.x -= this.speed;
          this.speed = Math.min(this.speed * 1.02, 5);
          this.isMoving = true;
        } else {
          this.speed = 0.5;
          this.isMoving = false;
          this.frameIndex = 0;
        }
      }

      if (this.isTransitioning) {
        this.x += this.direction === "right" ? this.speed : -this.speed;
        this.transitionFrames--;
        if (this.transitionFrames <= 0) {
          this.direction = this.targetDirection;
          this.isTransitioning = false;
        }
      }

      if (!this.isTransitioning && this.isMoving) {
        this.animateRunning();
      }
    }

    // this.handleDying();

    this.handleJump(keys);
    console.log(this.y);
  }

  // handleDying() {

  //   if (this.x >= 1000) {
  //     this.isDead = true;
  //     this.y += 10;
  //     this.isMoving = false;
  //   }
  // }

  handleStateChange() {
    if (this.state === "big" && !this.hasChangedToBig) {
      this.height = 100;
      this.y = 600 - this.height;
      this.groundLevel = this.y;
      console.log(this.y);
      this.hasChangedToBig = true;
    } else if (this.state !== "big") {
      this.hasChangedToBig = false;
    }
  }

  handleJump(keys) {
    if (keys[" "] && !this.isJumping) {
      this.vy = -10;
      this.isJumping = true;
    }
    // Apply gravity
    if (this.isJumping) {
      this.vy += this.gravity;
      this.y += this.vy;
    }

    // Stop falling when reaching the ground
    if (this.y >= this.groundLevel) {
      this.y = this.groundLevel;
      this.isJumping = false;
      this.vy = 0;
    }
  }

  startTransition(newDirection) {
    this.isTransitioning = true;
    this.targetDirection = newDirection;
    this.transitionFrames = this.speed * 20;
  }

  animateRunning() {
    if (Date.now() - this.lastUpdate >= this.timePerFrame) {
      this.frameIndex = (this.frameIndex + 1) % 3;
      this.lastUpdate = Date.now();
    }
  }

  animateClimbingFlag() {
    if (Date.now() - this.climbingLastUpdate >= this.timePerFrame) {
      this.climbingFrameIndex = (this.climbingFrameIndex + 1) % 2;
      this.climbingLastUpdate = Date.now();
    }
  }

  draw(ctx) {
    const spriteBigMargin = 4;
    const spriteSmallMargin = 2;
    const purpleColor = { r: 146, g: 144, b: 255 }; // RGB for the purple background

    let spriteWidth = 16;
    let spriteHeight;
    let sx = 0;
    let sy = 8;
    switch (this.state) {
      case "small":
        sx = 0;
        sy = 8;
        spriteHeight = 16;
        break;
      case "big":
        sx = 0;
        sy = 8 + 16 + 8;
        this.width = 100;
        spriteHeight = 32;
    }

    if (this.isTransitioning) {
      sx = 76;
    } else if (this.isMoving) {
      sx =
        spriteWidth +
        spriteBigMargin +
        this.frameIndex * (spriteWidth + spriteSmallMargin);
    } else {
    }
    if (this.isJumping) {
      sx = 96;
    }

    if (this.isDead) {
      sx = 116;
    }

    if (this.isClimbing) {
      sx = 136 + this.frameIndex * (spriteWidth + spriteSmallMargin);
    }

    ctx.save();

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = spriteWidth;
    tempCanvas.height = spriteHeight;

    tempCtx.drawImage(
      this.spritesheet,
      sx,
      sy,
      spriteWidth,
      spriteHeight,
      0,
      0,
      spriteWidth,
      spriteHeight
    );

    let imageData = tempCtx.getImageData(0, 0, spriteWidth, spriteHeight);
    imageData = this.removeBackgroundColor(imageData, purpleColor);
    tempCtx.putImageData(imageData, 0, 0);

    if (this.direction === "left") {
      ctx.scale(-1, 1);
      ctx.drawImage(
        tempCanvas,
        0,
        0,
        spriteWidth,
        spriteHeight,
        -this.x - this.width,
        this.y,
        this.width,
        this.height
      );
    } else {
      ctx.drawImage(
        tempCanvas,
        0,
        0,
        spriteWidth,
        spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }

    ctx.restore();
  }
}
