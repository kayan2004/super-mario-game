class LevelEnded extends Sprite {
  constructor(src, x, y, score) {
    super();

    // Position
    this.x = x;
    this.y = y;

    // Image
    this.image = new Image();
    this.image.src = src;

    // Score
    this.score = score;

    // Flag to indicate if the sprite should be removed
    this.markForRemoval = false;
  }

  update(sprites, keys) {
    // If the sprite is marked for removal, remove it
    if (this.markForRemoval) return true;
  }

  /**
   * Draws the sprite on the canvas.
   */
  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y);
    // Draw the score on the congrats screen
    ctx.font = "italic bold 30px 'Comic Sans MS'";
    ctx.fillStyle = "white";
    ctx.fillText(`Score: ${this.score}`, canvas.width - 220, this.y + 50);
  }
}

class GameInstructions extends Sprite {
  constructor(src, x, y) {
    super();

    // Position
    this.x = x;
    this.y = y;

    // Image
    this.image = new Image();
    this.image.src = src;
  }

  update(sprites, keys) {
    // If the space key is pressed, start the game by creating a new level generator and adding it to the sprites array
    if (keys[" "]) {
      let levelGenerator = new LevelGenerator();
      sprites.push(levelGenerator);
      // Reset the space key
      keys[" "] = false;
      // Return true to indicate that the sprite should be removed
      return true;
    }
  }

  /**
   * Draws the game instructions on the canvas.
   */
  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y);
  }
}

class GameStory extends Sprite {
  constructor(src, x, y) {
    super();

    // Position
    this.x = x;
    this.y = y;

    // Image
    this.image = new Image();
    this.image.src = "../images/story.png";
  }

  update(sprites, keys) {
    // If the space key is pressed, show the game instructions
    if (keys[" "]) {
      const gameInstructions = new GameInstructions(
        "../images/controls.png",
        0,
        0
      );
      sprites.push(gameInstructions);
      // Reset the space key
      keys[" "] = false;
      // Return true to indicate that the sprite should be removed
      return true;
    }
  }

  /**
   * Draws the game story on the canvas.
   */
  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y);
  }
}

class LevelGenerator extends Sprite {
  constructor() {
    super();

    // Current level
    this.level = 1;
    // Scores for each level
    this.levelScores = {};
    // Lives
    this.lives = 3;
    // Previous level
    this.previousLevel = null;
    // Game over flag
    this.gameOver = false;
    // Congrats screen active flag
    this.congratsScreenActive = false;
    // Game over screen active flag
    this.gameOverScreenActive = false;
    // Scaler
    this.scaler = 844 / 401;
    // Block positions
    this.blockPositions = [
      [320, 144],
      [352, 144],
      [384, 144],
      [1232, 144],
      [1264, 144],
      [1504, 144],
      [1600, 144],
      [1616, 144],
      [1888, 144],
      [2064, 144],
      [2080, 144],
      [2688, 144],
      [2704, 144],
      [2736, 144],
      [1280, 80],
      [1280 + 16, 80],
      [1280 + 16 * 2, 80],
      [1280 + 16 * 3, 80],
      [1280 + 16 * 4, 80],
      [1280 + 16 * 5, 80],
      [1280 + 16 * 6, 80],
      [1280 + 16 * 7, 80],
      [1456, 80],
      [1456 + 16, 80],
      [1456 + 16 * 2, 80],
      [1936, 80],
      [1936 + 16, 80],
      [1936 + 16 * 2, 80],
      [2048, 80],
      [2096, 80],
    ];
    // Surprise block positions
    this.surpriseBlockPositions = [
      [256, 144, "mushroom"],
      [336, 144, "coin"],
      [368, 144, "coin"],
      [1248, 144, "mushroom"],
      [1696, 144, "coin"],
      [1744, 144, "coin"],
      [1792, 144, "mushroom"],
      [2720, 144, "coin"],
      [352, 80, "coin"],
      [1504, 80, "coin"],
      [1744, 80, "coin"],
      [2064, 80, "coin"],
      [2080, 80, "coin"],
    ];
    // Tube positions
    this.tubePositions = [
      [448, 176, 1],
      [608, 160, 3],
      [736, 144, 5],
      [912, 144, 5],
      [2608, 176, 1],
      [2864, 176, 1],
    ];
    // Goomba positions (low number of goombas to make it easier)
    this.goombaPositionsLevel1 = [
      [200, 200],
      [800, 200],
      [840, 200],
      [1140, 200],
      [1180, 200],
    ];
    // Goomba positions level 2
    this.goombaPositionsLevel2 = [
      [200, 200],
      [500, 200],
      [800, 200],
      [1140, 200],
      [1180, 200],
    ];
    // Goomba positions level 3
    this.goombaPositionsLevel3 = [
      [200, 200],
      [500, 200],
      [800, 200],
      [840, 200],
      [1140, 200],
      [1180, 200],
      [2000, 200],
      [2200, 200],
      [2400, 200],
      [2500, 200],
      [2750, 200],
      [2900, 200],
    ];
    // Turtle positions level 1 (only one turtle to make it easier)
    this.turtlePositionsLevel1 = [[2700, 200]];
    // Turtle positions level 2
    this.turtlePositionsLevel2 = [
      [2700, 200],
      [2500, 200],
      [1800, 200],
    ];
    // Turtle positions level 3
    this.turtlePositionsLevel3 = [
      [2100, 200],
      [2300, 200],
      [2700, 200],
      [2800, 200],
      [1800, 200],
      [1900, 200],
      [1000, 200],
    ];
    // Flag to indicate if the level ended was created
    this.levelEndedWasCreated = false;
  }

  update(sprites, keys) {
    // Initialize score for the current level if not already done
    if (this.levelScores[this.level] === undefined) {
      this.levelScores[this.level] = 0;
    }

    let score = sprites.find((sprite) => sprite instanceof Score);
    if (score) score.score = this.levelScores[this.level];

    // If the hero has no lives left, set the game over flag to true
    if (this.lives <= 0) {
      this.gameOver = true;
    }

    // If the r key is pressed, reset the game
    if (keys["r"] || keys["R"]) {
      this.level = 1;
      this.levelScores = {};
      this.resetGame(sprites);
      this.handleLevelChange(sprites, keys);
      // Reset the r key to prevent continuous resetting
      keys["r"] = false;
      keys["R"] = false;
    }

    // If the game is over and the game over screen is not active,
    // reset the game state, display the game over screen, and update relevant flags.
    if (this.gameOver && !this.gameOverScreenActive) {
      this.lives = 3;
      console.log(this.levelScores);
      this.resetGame(sprites);
      const gameOverScreen = new LevelEnded(
        "../images/gameover.png",
        0,
        0,
        this.levelScores[this.level]
      );
      sprites.push(gameOverScreen);
      this.levelScores[this.level] = 0;
      this.gameOverScreenActive = true;
      this.gameOver = false;
      keys[" "] = false;
    }

    // If the game over screen is active and the space key is pressed,
    // reset the game over screen active flag and restart the level.
    if (this.gameOverScreenActive && keys[" "]) {
      this.gameOverScreenActive = false;
      keys[" "] = false;
      this.handleLevelChange(sprites, keys);
    }

    // If the current level is different from the previous level,
    if (this.level !== this.previousLevel) {
      // Reset the game state
      this.resetGame(sprites);

      // Create a new LevelEnded sprite to display the level ended screen
      if (this.level !== 1) {
        var levelEnded = new LevelEnded(
          `../images/level${this.level - 1}.png`,
          0,
          0,
          this.levelScores[this.level - 1] // Pass the current level's score
        );
        console.log(this.levelScores[this.level - 1]);
        // Add the level ended screen to the sprites array
        sprites.push(levelEnded);
      } else {
        this.handleLevelChange(sprites, keys);
      }
      // Set the congrats screen active flag to true
      this.congratsScreenActive = true;
      // Update the previous level to the current level
      this.previousLevel = this.level;
    }

    // If the congrats screen is active and the space key is pressed,
    if (this.congratsScreenActive && keys[" "] && this.level !== 1) {
      // Mark the level ended screen for removal
      let levelEnded = sprites.find((sprite) => sprite instanceof LevelEnded);
      if (levelEnded) levelEnded.markForRemoval = true;

      // Handle the level change
      this.handleLevelChange(sprites, keys);
      // Reset the congrats screen active flag
      this.congratsScreenActive = false;
      // Reset the space key to prevent continuous triggering
      keys[" "] = false;
    }
  }

  /**
   * Handles the transition to a new level by initializing and adding
   * necessary game elements to the sprites array.
   *
   * @param {Array} sprites - The array of current game sprites.
   * @param {Object} keys - The object representing the current state of keys.
   */
  handleLevelChange(sprites, keys) {
    // Initialize the background sprite
    var background = new Background("../images/background.png", 401, 240);

    // Initialize the hero sprite with its images
    var hero = new Hero("../images/player.png", "../images/playerl.png");

    // Initialize the obstacles generator with block positions
    var generateObstacles = new GenerateObstacles(
      this.blockPositions,
      this.surpriseBlockPositions,
      this.tubePositions
    );

    // Initialize the score display at a fixed position
    var score = new Score(10, 30, 0);

    // Initialize the level display at a calculated position
    var level = new Level(canvas.width / 2 - 60, 30, this.level);

    // Initialize the lives display at a fixed position
    var lives = new Lives(canvas.width - 135, 30, this.lives);

    // Initialize the winning area with a scaled position
    var winningArea = new WinningArea(
      3000 * this.scaler,
      0,
      500,
      canvas.height
    );

    // Generate enemies based on the current level
    var generateEnemies;
    switch (this.level) {
      case 1:
        generateEnemies = new GenerateEnemies(
          this.goombaPositionsLevel1,
          this.turtlePositionsLevel1
        );
        break;
      case 2:
        generateEnemies = new GenerateEnemies(
          this.goombaPositionsLevel2,
          this.turtlePositionsLevel2
        );
        break;
      case 3:
        generateEnemies = new GenerateEnemies(
          this.goombaPositionsLevel3,
          this.turtlePositionsLevel3
        );
        break;
      case 4:
        // No enemies to generate for level 4
        break;
    }

    sprites.push(background);
    sprites.push(hero);
    sprites.push(generateObstacles);
    sprites.push(generateEnemies);
    sprites.push(winningArea);
    sprites.push(score);
    sprites.push(level);
    sprites.push(lives);
  }

  updateScore(points) {
    // Add points to the current level score
    if (this.levelScores[this.level] !== undefined) {
      this.levelScores[this.level] += points;
    }
  }

  resetGame(sprites) {
    this.lives = 3;
    console.log("Resetting game. Current sprites:", sprites);
    sprites.forEach((sprite) => {
      sprite.markForRemoval = true;
    });
  }
}
