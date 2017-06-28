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
        game.load.spritesheet('cat', 'assets/sprites/cat.png', 16, 16);
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
        this.cursor = game.input.keyboard.addKeys({
            'up': Phaser.KeyCode.UP,
            'down': Phaser.KeyCode.DOWN,
            'left': Phaser.KeyCode.LEFT,
            'right': Phaser.KeyCode.RIGHT,
            'jump': Phaser.KeyCode.SPACEBAR
        });
        // Create the player in the middle of the game
        this.player = game.add.sprite(70, 100, 'cat', 5);
        this.player.animations.add(cat.STATES.sleep, [0, 1, 2, 3, 4]);
        this.player.animations.add(cat.STATES.lay, [5, 6, 7, 8, 9]);
        this.player.animations.add(cat.STATES.sit, [10, 11, 12, 13, 14]);
        this.player.animations.add(cat.STATES.lick, [15, 16, 17, 18, 19]);
        this.player.animations.add(cat.STATES.stand, [20, 21, 22, 23, 24]);
        this.player.animations.add(cat.STATES.move, [15, 16, 17, 18, 19]);
        this.player.animations.add(cat.STATES.jump, [30, 31, 32, 33, 34]);

        this.game.physics.arcade.enable(this.player);

        // camera
        this.game.camera.follow(this.player);

        // Add gravity to make it fall
        this.player.body.gravity.y = 600;
    },

    update: function() {
        // Make the player and the walls collide
        game.physics.arcade.collide(this.player, this.walls);

        // Call the 'takeCoin' function when the player takes a coin
        game.physics.arcade.overlap(this.player, this.coins, this.takeCoin, null, this);

        // Call the 'restart' function when the player touches the enemy
        game.physics.arcade.overlap(this.player, this.hazards, this.restart, null, this);

        // Here we update the game 60 times per second
        var now = Date.now();
        mainState.lastObedient = mainState.lastObedient || now;
        mainState.lastObedientCheck = mainState.lastObedientCheck || now;

        var stateKeys = cat.TRANSITIONS[cat.state].keys;

        var keyCheck = {
            up: this.cursor.up.isDown,
            down: this.cursor.down.isDown,
            left: this.cursor.left.isDown,
            right: this.cursor.right.isDown,
            space: this.cursor.jump.isDown
        };

        if (now - mainState.lastObedientCheck > 1000 && !window.CAT_TREATS) {
            mainState.lastObedientCheck = now;
            if (!cat.obedient) {
                cat.obedient = Math.random() > 0.5;
                mainState.lastObedient = mainState.lastObedient || (cat.obedient * now);
            } else {
                cat.obedient = !(now - mainState.lastObedient > 1000);
            }

            if (!cat.obedient) {
                cat.state = cat.random();
                console.log('cat state', cat.state);
            }
        }


        game.physics.arcade.collide(this.player, this.collisionLayer);

        if (cat.obedient || window.CAT_TREATS) {
            _.some(keyCheck, function(check, key) {
                var found = check && key in stateKeys;
                if (found) {
                    cat.state = stateKeys[key];
                }
                return found;
            });
        } else {
            // Disobedient cat presses random keys
            _.each(_.keys(keyCheck), function(key) {
                keyCheck[key] = Math.random() > 0.5;
            });
        }

        if (cat.state === cat.STATES.move || cat.state === cat.STATES.jump) {
            // Make the player jump if he is touching the ground
            if (keyCheck.space && this.player.body.blocked.down) {
                this.player.body.velocity.y = -250;
                cat.state = cat.STATES.jump;
            }

            if (!this.player.body.blocked.down) {
                cat.state = cat.STATES.move;
            }

            if (keyCheck.left) {
                this.player.body.velocity.x = -200;
            } else if (keyCheck.right) {
                this.player.body.velocity.x = 200;
            } else {
                this.player.body.velocity.x = 0;
                cat.state = cat.STATES.stand;
            }
        }

        this.player.animations.play(cat.state, 2, true);
    },
};
