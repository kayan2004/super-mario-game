class GameStats extends Sprite {
  constructor(x, y) {
    super();
    // Position
    this.x = x;
    this.y = y;
    // Flag to indicate if the sprite should be removed
    this.markForRemoval = false;
  }

  update(sprites, keys) {
    // If the sprite is marked for removal, remove it
    if (this.markForRemoval) {
      return true;
    }
  }
}

class Score extends GameStats {
  constructor(x, y) {
    super(x, y);

    // Text
    this.text = "Score";
    // Score
    this.score = 0;
  }

  update(sprites, keys) {
    // If the sprite is marked for removal, remove it
    if (this.markForRemoval) {
      return true;
    }
  }

  draw(ctx) {
    ctx.font = "italic bold 30px 'Comic Sans MS'";
    ctx.fillStyle = "white";
    ctx.fillText(this.text + ": " + this.score, this.x, this.y);
  }
}

class Lives extends GameStats {
  constructor(x, y) {
    super(x, y);
    // Lives
    this.lives = 3;
  }

  update(sprites, keys) {
    // If the sprite is marked for removal, remove it
    if (this.markForRemoval) {
      return true;
    }

    // Find the level generator sprite
    let levelGenerator = sprites.find(
      (sprite) => sprite instanceof LevelGenerator
    );

    // Update the lives based on the level generator
    this.lives = levelGenerator.lives;
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
    // Level
    this.level = level;
  }

  update(sprites, keys) {
    // If the sprite is marked for removal, remove it
    if (this.markForRemoval) {
      return true;
    }
  }

  draw(ctx) {
    ctx.font = "italic bold 30px 'Comic Sans MS'";
    ctx.fillStyle = "white";
    ctx.fillText("Level: " + this.level, this.x, this.y);
  }
}
