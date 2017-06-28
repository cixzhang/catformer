var mainState = {

    lastObedient: null,
    lastObedientCheck: null,

    preload: function() {  
        // Here we preload the assets
        game.load.image('player', 'assets/sprites/player.png');
        game.load.image('wall', 'assets/sprites/wall.png');
        game.load.image('coin', 'assets/sprites/coin.png');
        game.load.image('lava', 'assets/sprites/lava.png');
        game.load.image('test_cat', 'assets/sprites/test_cat.png');

        // tilesets
        game.load.tilemap('tilemap', 'assets/test_map2.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/sprites/tileset.png');
    },

    create: function() {  
        // Here we create the game
        // Set the background color to blue
        game.stage.backgroundColor = '#49a';

        // Start the Arcade physics system (for movements and collisions)
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.map = game.add.tilemap('tilemap');
        this.map.addTilesetImage('test_tileset', 'tiles');

        this.collisionLayer = this.map.createLayer('Collision');
        this.backgroundLayer = this.map.createLayer('Background');
        //this.map.setCollisionBetween(1, 100, true, 'Tile Layer 1');
    
        //Before you can use the collide function you need to set what tiles can collide
        this.map.setCollisionBetween(1, 100, true, 'Collision');

        // sets the size of the game world, doesn't affect the canvas...
        this.collisionLayer.resizeWorld();

        // Variable to store the arrow key pressed
        this.cursor = game.input.keyboard.createCursorKeys();

        // Create the player in the middle of the game
        this.player = game.add.sprite(70, 100, 'test_cat');

        this.game.physics.arcade.enable(this.player);

        // camera
        this.game.camera.follow(this.player);

        // Add gravity to make it fall
        this.player.body.gravity.y = 600;
    },

    update: function() {
        var now = Date.now();
        mainState.lastObedient = mainState.lastObedient || now;
        mainState.lastObedientCheck = mainState.lastObedientCheck || now;

        if (now - mainState.lastObedientCheck > 1000) {
            mainState.lastObedientCheck = now;
            if (!cat.obedient) {
                cat.obedient = Math.random() > 0.5;
                mainState.lastObedient = mainState.lastObedient || (cat.obedient * now);
            } else {
                cat.obedient = !(now - mainState.lastObedient > 1000);
            }
            console.log('obedience', cat.obedient);
        }

        game.physics.arcade.collide(this.player, this.collisionLayer);

        // Here we update the game 60 times per second
        if (this.cursor.left.isDown) 
            this.player.body.velocity.x = -200;
        else if (this.cursor.right.isDown) 
            this.player.body.velocity.x = 200;
        else 
            this.player.body.velocity.x = 0;

        // Make the player jump if he is touching the ground
        if (this.cursor.up.isDown && this.player.body.blocked.down) {
            this.player.body.velocity.y = -250;
        }

    },
};