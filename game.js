var game = new Phaser.Game(368, 192, Phaser.AUTO, '', this, false, false);
game.state.add('main', mainState);
game.state.start('main');