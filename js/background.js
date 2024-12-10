class Background extends Sprite {
  constructor(imageSrc, width, height) {
    super();

    // Image
    this.image = new Image();
    this.image.src = imageSrc;

    // Dimensions
    this.width = width;
    this.height = height;

    // Audio
    this.audio = new Audio("../sounds/background.ogg");
    this.audio.loop = true;
    this.stopAudio = false;

    // Position
    this.backgroundX = 0;

    // Removal
    this.markForRemoval = false;
  }

  update(sprites, keys) {
    // Pause and reset the audio if the sprite is marked for removal
    if (this.markForRemoval) {
      this.audio.pause();
      this.audio.currentTime = 0;
      return true;
    }

    // Find the hero sprite
    let hero = sprites.find((sprite) => sprite instanceof Hero);

    if (hero) {
      // Adjust the background position based on the hero's movement direction
      if (hero.direction === "right") {
        this.backgroundX += hero.speed;
      }

      // Ensure the background position stays within the bounds of the image
      if (this.backgroundX <= 0) {
        this.backgroundX = 0;
      } else if (this.backgroundX >= this.image.width - this.width) {
        this.backgroundX = this.image.width - this.width;
      }

      // Play the background audio
      this.audio.play();
    }
  }

  /**
   * Draws the background image on the canvas
   * The image is being drawn twice one at the start and the other at the end to simulate seamless looping
   */
  draw(ctx) {
    ctx.drawImage(
      this.image, // The image to draw
      this.backgroundX, // The x-coordinate of the source image
      0, // The y-coordinate of the source image
      this.width, // The width of the source image
      this.height, // The height of the source image
      0, // The x-coordinate on the canvas
      0, // The y-coordinate on the canvas
      canvas.width, // The width to draw the image on the canvas
      canvas.height // The height to draw the image on the canvas
    );

    ctx.drawImage(
      this.image, // The image to draw
      this.backgroundX + canvas.width, // The x-coordinate of the source image
      0, // The y-coordinate of the source image
      this.width, // The width of the source image
      this.height, // The height of the source image
      canvas.width, // The x-coordinate on the canvas
      0, // The y-coordinate on the canvas
      canvas.width, // The width to draw the image on the canvas
      canvas.height // The height to draw the image on the canvas
    );
  }
}
