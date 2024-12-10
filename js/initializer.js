// Initialize a new game instance
const myGame = new Game();

// Create a new game story sprite to initiate the game
var gameStory = new GameStory("../images/story.png", 0, 0);

// Add the game story sprite to the game
myGame.addSprite(gameStory);

// Start the game animation
myGame.animate();
