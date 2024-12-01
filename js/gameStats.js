class GameStats extends Sprite {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.markForRemoval = false;
  }

  update(sprites, keys) {
    if (this.markForRemoval) {
      return true;
    }
  }
}

class Score extends GameStats {
  constructor(x, y) {
    super(x, y);
    this.score = 0;
  }

  update(sprites, keys) {
    if (this.markForRemoval) {
      return true;
    }
  }

  draw(ctx) {
    ctx.font = "italic bold 30px 'Comic Sans MS'";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + this.score, this.x, this.y);
  }
}

class Lives extends GameStats {
  constructor(x, y) {
    super(x, y);
    this.lives = 3;
  }

  update(sprites, keys) {
    if (this.markForRemoval) {
      return true;
    }

    let levelGenerator = sprites.find(
      (sprite) => sprite instanceof LevelGenerator
    );

    this.lives = levelGenerator.lives;

    // if (this.lives <= 0) {
    //   let levelGenerator = sprites.find(
    //     (sprite) => sprite instanceof LevelGenerator
    //   );
    //   console.log(sprites);
    //   levelGenerator.gameOver = true;
    // }
  }

  draw(ctx) {
    ctx.font = "italic bold 30px 'Comic Sans MS'";
    ctx.fillStyle = "white";
    ctx.fillText("Lives: " + this.lives, this.x, this.y);
  }
}

class Level extends GameStats {
  constructor(x, y, level) {
    super(x, y);
    this.level = level;
  }

  update(sprites, keys) {
    if (this.markForRemoval) {
      return true;
    }

    // let generateLevel = sprites.find((sprite) => sprite instanceof GenerateLevel);
    // if (generateLevel) {
    //   this.level = generateLevel.level;
    // }
  }

  draw(ctx) {
    ctx.font = "italic bold 30px 'Comic Sans MS'";
    ctx.fillStyle = "white";
    ctx.fillText("Level: " + this.level, this.x, this.y);
  }
}
