/* globals Phaser game */
var creditState = {
  preload: function() {
    // game scaling
    game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    game.scale.setUserScale(3, 3);

    game.renderer.renderSession.roundPixels = true;
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

    game.load.spritesheet('thanks', 'assets/sprites/thanks.png', 200, 200);
  },
  create: function() {
    game.stage.backgroundColor = '#000000';
    this.thanks = game.add.sprite(33, 0, 'thanks', 0);
    this.startTime = null;
  },
  update: function() {
    var now = Date.now();

    this.startTime = this.startTime || now;

    if (now - this.startTime > 5000) {
      game.state.start('main');
    }
  }
};
