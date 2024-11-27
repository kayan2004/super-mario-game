class Score extends Sprite {
  constructor() {
    super();
    this.score = 0;
  }

  update(sprites, keys) {}

  draw(ctx) {
    ctx.font = "30px Monospace";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + this.score, 10, 30);
  }
}
