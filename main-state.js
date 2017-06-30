/* globals Phaser _ game cat */
/* eslint no-console: 0 */

var mainState = {
    preload: function() {
        // Here we preload the assets
        game.load.image('test_cat', 'assets/sprites/test_cat.png');

        // tilesets
        game.load.tilemap('tilemap', 'assets/test_map2.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/sprites/tileset.png');
        game.load.spritesheet('cat', 'assets/sprites/cat.png', 16, 16);
        game.load.spritesheet('bird', 'assets/sprites/bird.png', 16, 16);
        game.load.spritesheet('coin', 'assets/sprites/coin.png', 20, 20);

        // game scaling
        game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        game.scale.setUserScale(3, 3);

        game.renderer.renderSession.roundPixels = true;
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
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
        this.player.animations.add(cat.STATES.move, [25, 26, 27, 28, 29]);
        this.player.animations.add(cat.STATES.jump, [30, 31, 32, 33, 34]);
        this.player.anchor.setTo(.5,.5);

        this.birds = game.add.group();

        game.physics.arcade.enable(this.player);

        // camera
        game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

        // Add gravity to make it fall
        this.player.body.gravity.y = 600;

        // Keep track of keys pressed
        this.keyCheck = {
            up: false,
            down: false,
            left: false,
            right: false,
            space: false
        };

        this.facing = -1;

        // Timers
        this.lastObedient = null;
        this.lastObedientCheck = null;
        this.lastKeyCheck = null;
        this.lastBirdSpawn = null;
    },

    update: function() {

        // Here we update the game 60 times per second
        var now = Date.now();

        game.physics.arcade.collide(this.player, this.collisionLayer);
        game.physics.arcade.collide(this.birds, this.collisionLayer);

        if (cat.state >= cat.STATES.stand) {
            game.physics.arcade.overlap(this.player, this.birds, this.killBird, null, this);
        }

        this.checkSpawnBird(now);
        this.checkObedience(now);
        this.checkKeys(now);

        this.moveCat(now);
    },

    moveCat() {
        var willFace = this.facing;

        this.player.body.velocity.x = 0;
        if (cat.state === cat.STATES.move || cat.state === cat.STATES.jump) {
            // Make the player jump if he is touching the ground
            if (this.keyCheck.space && this.player.body.blocked.down) {
                this.player.body.velocity.y = -250;
                cat.state = cat.STATES.stand;
            }

            if (this.keyCheck.left) {
                willFace = -1;
                this.player.body.velocity.x = -100;
                cat.state = cat.STATES.move;
            } else if (this.keyCheck.right) {
                willFace = 1;
                this.player.body.velocity.x = 100;
                cat.state = cat.STATES.move;
            } else {
                this.player.body.velocity.x = 0;
                cat.state = cat.STATES.stand;
            }
        }

        if (!this.player.body.blocked.down) {
            cat.state = cat.STATES.jump;
            this.player.angle += (10 * this.facing);
        } else {
            this.player.angle = 0;
        }

        if (willFace !== this.facing) {
            this.player.scale.x *= -1;
            this.facing = willFace;
        }
        this.player.animations.play(cat.state, cat.state + 1, true);
    },

    checkObedience(now) {
        this.lastObedient = this.lastObedient || now;
        this.lastObedientCheck = this.lastObedientCheck || now;

        // Check if cat is going to be obedient
        if (now - this.lastObedientCheck > 1000 && !window.CAT_TREATS) {
            this.lastObedientCheck = now;
            if (!cat.obedient) {
                // Flip a coin to see if cat will become obedient
                cat.obedient = Math.random() > 0.5;
                this.lastObedient = (cat.obedient * now) || this.lastObedient;
            } else {
                // Cat will stay obedient for at least a few seconds
                cat.obedient = !(now - this.lastObedient > 5000);
            }

            if (!cat.obedient) {
                cat.state = cat.random();
                // Disobedient cat presses random keys
                _.each(_.keys(this.keyCheck), (key) => {
                    this.keyCheck[key] = Math.random() > 0.5;
                });
                cat.machine(this.keyCheck);
                console.log('cat state', cat.state);
            }
        }
    },

    checkKeys(now) {
        this.lastKeyCheck = this.lastKeyCheck || now;

        if (cat.obedient || window.CAT_TREATS) {
            this.keyCheck = {
                up: this.cursor.up.isDown,
                down: this.cursor.down.isDown,
                left: this.cursor.left.isDown,
                right: this.cursor.right.isDown,
                space: this.cursor.jump.isDown
            };

            // short delay between state swaps
            if (now - this.lastKeyCheck > 100) {
                this.lastKeyCheck = now;
                cat.machine(this.keyCheck);
            }
        }
    },

    checkSpawnBird(now) {
        this.lastBirdSpawn = this.lastBirdSpawn || now;

        if (now - this.lastBirdSpawn > 5000) {
            var willSpawn = Math.random() > 0.5;
            if (willSpawn) {
                var dirX = Math.random > 0.5 ? -1 : 1;
                var randX = Math.floor(Math.random() * 30) + 10;
                var randY = Math.floor(Math.random() * 30) + 10;
                this.spawnBird(this.player,
                    this.player.x + (randX * dirX),
                    this.player.y + randY);
            }

            this.lastBirdSpawn = now;
        }
    },

    spawnBird(player, x, y) {
        var deltaX = player.x - x;
        var deltaY = player.y - y;
        var spawnX = x - (deltaX * 20);
        var spawnY = y - deltaY + 100;
        var bird = game.add.sprite(spawnX, spawnY, 'bird', 0);
        bird.animations.add('fly', [0, 1]);
        bird.animations.add('rest', [2, 3]);
        bird.animations.add('dead', [4]);
        bird.anchor.setTo(.5,.5);

        this.birds.add(bird);
        bird.animations.play('fly', 8, true);

        bird.scale.x *= Math.sign(x - spawnX);

        var tween = game.add.tween(bird).to({x: x, y: y},
            2400, Phaser.Easing.Linear.In, true, 0, 0);
        tween.onComplete.addOnce(() => {
            game.physics.arcade.enable(bird);
            bird.body.gravity.y = 100;
            bird.animations.play('rest', 1, true);
        });
        return bird;
    },

    killBird(player, bird) {
        bird.animations.play('dead', 1, true);
        bird.animations.stop();
        bird.body.gravity.y = 600;
    }
};
