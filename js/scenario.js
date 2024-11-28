const blockPositions = [
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

const surpriseBlockPositions = [
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

const tubePositions = [
  [448, 176, 1],
  [608, 160, 3],
  [736, 144, 5],
  [912, 144, 5],
  [2608, 176, 1],
  [2864, 176, 1],
];

const myGame = new Game();
var background = new Background("../sprites/background4.png", 401, 240);
var hero = new Hero("../sprites/player.png", "../sprites/playerl.png");
var score = new Score(10, 30);
var level = new Level(canvas.width / 2 - 60, 30, 1);
var lives = new Lives(canvas.width - 135, 30);
var generateObstacles = new GenerateObstacles(
  blockPositions,
  surpriseBlockPositions,
  tubePositions
);
var goomba = new Goomba(
  "../sprites/enemy.png",
  "../sprites/enemyr.png",
  1200,
  200,
  35,
  35
);

myGame.addSprite(background);
myGame.addSprite(hero);
myGame.addSprite(level);
myGame.addSprite(lives);
myGame.addSprite(generateObstacles);
myGame.addSprite(score);
myGame.addSprite(goomba);
myGame.animate();
