// Initialize the game and add the hero with the updated frame data
const myGame = new Game();
var hero = new Hero("images/mario.png", 0, canvas.height - 50, 50, 50, 120, 3); // 3 frames for running animation
myGame.addSprite(hero);
myGame.animate();
