const myGame = new Game();
// var levelGenerator = new LevelGenerator();
// myGame.addSprite(levelGenerator);
var gameStory = new GameStory("../sprites/story.png", 0, 0);
myGame.addSprite(gameStory);
myGame.animate();
