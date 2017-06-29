var mainState = {

    lastObedient: null,
    lastObedientCheck: null,

    preload: function() {  
        // Here we preload the assets
        game.load.image('test_cat', 'assets/sprites/test_cat.png');

        // tilesets
        game.load.tilemap('tilemap', 'assets/test_map2.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/sprites/tileset.png');
        game.load.spritesheet('cat', 'assets/sprites/cat.png', 16, 16);

        // game scaling
        game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;  
        game.scale.setUserScale(3, 3);

        game.renderer.renderSession.roundPixels = true;  
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas)  
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

        game.physics.arcade.enable(this.player);

        //this.player.smoothed = false;
        //this.player.scale.set(4);

        // camera
        game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

        // Add gravity to make it fall
        this.player.body.gravity.y = 600;
    },

    update: function() {

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
