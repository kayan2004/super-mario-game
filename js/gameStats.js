class Score extends Sprite {
  constructor(x, y) {
    super();
    this.score = 0;
    this.x = x;
    this.y = y;
  }

  update(sprites, keys) {}

  draw(ctx) {
    ctx.font = "italic bold 30px 'Comic Sans MS'";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + this.score, this.x, this.y);
  }
}

class Lives extends Sprite {
  constructor(x, y) {
    super();
    this.lives = 3;
    this.x = x;
    this.y = y;
  }

  update(sprites, keys) {}

  draw(ctx) {
    ctx.font = "italic bold 30px 'Comic Sans MS'";
    ctx.fillStyle = "white";
    ctx.fillText("Lives: " + this.lives, this.x, this.y);
  }
}

class Level extends Sprite {
  constructor(x, y, level) {
    super();
    this.level = level;
    this.x = x;
    this.y = y;
  }

  update(sprites, keys) {}

  draw(ctx) {
    ctx.font = "italic bold 30px 'Comic Sans MS'";
    ctx.fillStyle = "white";
    ctx.fillText("Level: " + this.level, this.x, this.y);
  }
}
