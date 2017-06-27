var mainState = {

    lastObedient: null,
    lastObedientCheck: null,

    // Function to kill a coin
    takeCoin: function(player, coin) {
        coin.kill();
    },

    // Function to restart the game
    restart: function() {
        game.state.start('main');
    },

    preload: function() {  
        // Here we preload the assets
        game.load.image('player', 'assets/sprites/player.png');
        game.load.image('wall', 'assets/sprites/wall.png');
        game.load.image('coin', 'assets/sprites/coin.png');
        game.load.image('lava', 'assets/sprites/lava.png');
    },

    create: function() {  
        // Here we create the game
        // Set the background color to blue
        game.stage.backgroundColor = '#3598db';

        // Start the Arcade physics system (for movements and collisions)
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Add the physics engine to all game objects
        game.world.enableBody = true;

        // Variable to store the arrow key pressed
        this.cursor = game.input.keyboard.addKeys({
            'up': Phaser.KeyCode.UP,
            'down': Phaser.KeyCode.DOWN,
            'left': Phaser.KeyCode.LEFT,
            'right': Phaser.KeyCode.RIGHT,
            'jump': Phaser.KeyCode.SPACEBAR
        });
        // Create the player in the middle of the game
        this.player = game.add.sprite(70, 100, 'player');

        // Add gravity to make it fall
        this.player.body.gravity.y = 600;

        // Create 3 groups that will contain our objects
        this.walls = game.add.group();
        this.coins = game.add.group();
        this.hazards = game.add.group();

        // Design the level. x = wall, o = coin, ! = lava.
        var level = [
            'xxxxxxxxxxxxxxxxxxxxxx',
            '!         !          x',
            '!                 o  x',
            '!         o          x',
            '!                    x',
            '!     o   !    x     x',
            'xxxxxxxxxxxxxxxx!!!!!x',
        ];

        // Create the level by going through the array
        for (var i = 0; i < level.length; i++) {
            for (var j = 0; j < level[i].length; j++) {

                // Create a wall and add it to the 'walls' group
                if (level[i][j] == 'x') {
                    var wall = game.add.sprite(30+20*j, 30+20*i, 'wall');
                    this.walls.add(wall);
                    wall.body.immovable = true; 
                }

                // Create a coin and add it to the 'coins' group
                else if (level[i][j] == 'o') {
                    var coin = game.add.sprite(30+20*j, 30+20*i, 'coin');
                    this.coins.add(coin);
                }

                // Create a enemy and add it to the 'enemies' group
                else if (level[i][j] == '!') {
                    var hazard = game.add.sprite(30+20*j, 30+20*i, 'lava');
                    this.hazards.add(hazard);
                }
            }
        }
    },

    update: function() {
        // Make the player and the walls collide
        game.physics.arcade.collide(this.player, this.walls);

        // Call the 'takeCoin' function when the player takes a coin
        game.physics.arcade.overlap(this.player, this.coins, this.takeCoin, null, this);

        // Call the 'restart' function when the player touches the enemy
        game.physics.arcade.overlap(this.player, this.hazards, this.restart, null, this);

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

            // Disobedient cat performs a random action and presses random keys
            if (!cat.obedient) {
                cat.state = cat.random();
                console.log('cat state', cat.state);
                _.each(_.keys(keyCheck), function(key) {
                    keyCheck[key] = Math.random() > 0.5;
                });
            }
        }

        // Here we update the game 60 times per second
        if (cat.obedient || window.CAT_TREATS) {
            _.some(keyCheck, function(check, key) {
                var found = check && key in stateKeys;
                if (found) {
                    cat.state = stateKeys[key];
                }
                return found;
            });
        }

        if (cat.state === cat.STATES.move || cat.state === cat.STATES.jump) {
            // Make the player jump if he is touching the ground
            if (keyCheck.space && this.player.body.touching.down) {
                this.player.body.velocity.y = -250;
                cat.state = cat.STATES.jump;
            }

            if (!this.player.body.touching.down) {
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

        // TODO: cat rendering after all state resolutions here
    },
};