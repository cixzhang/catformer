var game = new Phaser.Game(800, 600, Phaser.AUTO, '');
game.state.add('main', mainState);
game.state.start('main');