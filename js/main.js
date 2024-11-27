const myGame = new Game();
var background = new Background("../sprites/background4.png", 401, 240);
myGame.addSprite(background);
var hero = new Hero("../sprites/player.png", "../sprites/playerl.png");
myGame.addSprite(hero);
// var block = new Block("../sprites/tiles.png", 35, 35, 650, 400);

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
var generateObstacles = new GenerateObstacles(
  blockPositions,
  surpriseBlockPositions
);
var surpriseBlock = new SurpriseBlock(
  "../sprites/tiles.png",
  35,
  35,
  541,
  306,
  "mushroom"
);
var coin = new Coin("../sprites/tiles.png", 35, 35, 200, 400);
var goomba = new Goomba(
  "../sprites/enemy.png",
  "../sprites/enemyr.png",
  650,
  200,
  35,
  35
);

var score = new Score();
myGame.addSprite(generateObstacles);
myGame.addSprite(score);
myGame.addSprite(goomba);
myGame.animate();
