
var creditState = {
  preload: function() {
    // game scaling
    game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    game.scale.setUserScale(3, 3);
  },
  create: function() {
    game.stage.backgroundColor = '#000000';
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
