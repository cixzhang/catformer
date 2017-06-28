var game = new Phaser.Game(400, 288, Phaser.AUTO, '');
game.state.add('main', mainState);
game.state.start('main');