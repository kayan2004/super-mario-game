class LevelEnded extends Sprite {
  constructor(src, x, y) {
    super();
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = src;
    this.toRemove = false;
  }

  update(sprites, keys) {
    if (this.toRemove) {
      return true;
    }
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y);
  }
}
class GameInstructions extends Sprite {
  constructor(src, x, y) {
    super();
    this.x = x;
    this.y = y;

    this.image = new Image();
    this.image.src = src;
  }

  update(sprites, keys) {
    if (keys[" "]) {
      let levelGenerator = new LevelGenerator();
      sprites.push(levelGenerator);
      keys[" "] = false;
      return true;
    }
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y);
  }
}

class GameStory extends Sprite {
  constructor(src, x, y) {
    super();
    this.x = x;
    this.y = y;

    this.image = new Image();
    this.image.src = "../sprites/story.png";
  }

  update(sprites, keys) {
    if (keys[" "]) {
      const gameInstructions = new GameInstructions(
        "../sprites/controls.png",
        0,
        0
      );
      sprites.push(gameInstructions);
      keys[" "] = false;
      return true;
    }
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y);
  }
}

class LevelGenerator extends Sprite {
  constructor() {
    super();
    this.gameOver = false;
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.previousLevel = null;
    this.scaler = 844 / 401;
    this.timeBetweenLevels = 4000;
    this.blockPositions = [
      [320, 144],
      [352, 144],
      [384, 144],
      [1232, 144],
      [1232, 144],
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

    this.surpriseBlockPositions = [
      [256, 144, "mushroom"],
      [336, 144, "mushroom"],
      [368, 144, "coin"],
      [1248, 144, "coin"],
      [1696, 144, "coin"],
      [1744, 144, "coin"],
      [1792, 144, "coin"],
      [2720, 144, "coin"],
      [352, 80, "coin"],
      [1504, 80, "coin"],
      [1744, 80, "coin"],
      [2064, 80, "coin"],
      [2080, 80, "coin"],
      [352, 80, "coin"],
    ];

    this.tubePositions = [
      [448, 176, 1],
      [608, 160, 3],
      [736, 144, 5],
      [912, 144, 5],
      [2608, 176, 1],
      [2864, 176, 1],
    ];

    this.goombaPositions = [
      [200, 200],
      [500, 200],
      [800, 200],
      [840, 200],
      [1140, 200],
      [1180, 200],
    ];

    this.turtlePositions = [
      [2700, 200],
      [2500, 200],
      [1800, 200],
    ];

    this.levelTransitionTime = null;
    this.congratsScreenActive = false;
    this.gameOverScreenActive = false;
  }

  update(sprites, keys) {
    let score = sprites.find((sprite) => sprite instanceof Score);
    let level = sprites.find((sprite) => sprite instanceof Level);
    if (score) score.score = this.score;
    if (level) level.level = this.level;
    console.log(this.gameOver);

    if (this.lives <= 0) {
      this.gameOver = true;
    }

    if (this.gameOver && !this.gameOverScreenActive) {
      console.log("game over");
      this.lives = 3;
      this.resetGame(sprites);
      console.log(sprites);
      const gameOverScreen = new LevelEnded("../sprites/gameover.png", 0, 0);
      sprites.push(gameOverScreen);
      this.gameOverScreenActive = true;
      this.gameOver = false;
      keys[" "] = false;
    }

    if (this.gameOverScreenActive && keys[" "]) {
      sprites.forEach((sprite) => {
        if (sprite instanceof LevelEnded) {
          sprite.toRemove = true;
        }
      });

      this.gameOverScreenActive = false;

      keys[" "] = false;
      this.handleLevelChange(sprites, keys);
    }

    if (this.level !== this.previousLevel) {
      this.resetGame(sprites);

      var levelEnded = new LevelEnded(
        `../sprites/level${this.level}.png`,
        0,
        0
      );
      sprites.push(levelEnded);
      console.log("created");

      this.congratsScreenActive = true;
      this.previousLevel = this.level;
    }

    if (this.congratsScreenActive && keys[" "]) {
      console.log("removed");
      sprites.forEach((sprite) => {
        if (sprite instanceof LevelEnded) {
          sprite.markForRemoval = true;
        }
      });

      this.handleLevelChange(sprites, keys);
      this.congratsScreenActive = false;

      keys[" "] = false;
    }
  }

  handleLevelChange(sprites, keys) {
    switch (this.level) {
      case 1:
        var background = new Background("../sprites/background5.png", 401, 240);
        sprites.push(background);
        var hero = new Hero("../sprites/player.png", "../sprites/playerl.png");
        var generateObstacles = new GenerateObstacles(
          this.blockPositions,
          this.surpriseBlockPositions,
          this.tubePositions
        );
        var generateEnemies = new GenerateEnemies(
          this.goombaPositions,
          this.turtlePositions
        );
        var score = new Score(10, 30, this.score);
        var level = new Level(canvas.width / 2 - 60, 30, this.level);
        var lives = new Lives(canvas.width - 135, 30, this.lives);
        var winningArea = new WinningArea(
          700 * this.scaler,
          0,
          500,
          canvas.height
        );
        sprites.push(hero);
        sprites.push(generateObstacles);
        sprites.push(generateEnemies);
        sprites.push(score);
        sprites.push(level);
        sprites.push(lives);
        sprites.push(winningArea);

        break;
      case 2:
        var background = new Background("../sprites/background5.png", 401, 240);
        sprites.push(background);
        var hero = new Hero("../sprites/player.png", "../sprites/playerl.png");
        var generateObstacles = new GenerateObstacles(
          this.blockPositions,
          this.surpriseBlockPositions,
          this.tubePositions
        );
        var generateEnemies = new GenerateEnemies(
          this.goombaPositions,
          this.turtlePositions
        );

        var winningArea = new WinningArea(
          700 * this.scaler,
          0,
          500,
          canvas.height
        );
        var score = new Score(10, 30, this.score);
        var level = new Level(canvas.width / 2 - 60, 30, this.level);
        var lives = new Lives(canvas.width - 135, 30, this.lives);
        sprites.push(hero);
        sprites.push(generateObstacles);
        sprites.push(generateEnemies);
        sprites.push(score);
        sprites.push(level);
        sprites.push(lives);
        sprites.push(winningArea);

        break;
      case 3:
        var background = new Background("../sprites/background5.png", 401, 240);
        sprites.push(background);
        var hero = new Hero("../sprites/player.png", "../sprites/playerl.png");
        var generateObstacles = new GenerateObstacles(
          this.blockPositions,
          this.surpriseBlockPositions,
          this.tubePositions
        );
        var generateEnemies = new GenerateEnemies(
          this.goombaPositions,
          this.turtlePositions
        );
        var winningArea = new WinningArea(
          500 * this.scaler,
          0,
          500,
          canvas.height
        );
        var score = new Score(10, 30, this.score);
        var level = new Level(canvas.width / 2 - 60, 30, this.level);
        var lives = new Lives(canvas.width - 135, 30, this.lives);
        sprites.push(hero);
        sprites.push(generateObstacles);
        sprites.push(generateEnemies);
        sprites.push(score);
        sprites.push(level);
        sprites.push(lives);
        sprites.push(winningArea);
        break;
      case 4:
        break;
    }
  }

  resetGame(sprites) {
    console.log(sprites);
    sprites.forEach((sprite) => {
      sprite.markForRemoval = true;
    });
  }
}
