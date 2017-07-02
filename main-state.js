/* globals Phaser _ game cat */
/* eslint no-console: 0 */

window.CAT_TREATS = true;
var mainState = {
    preload: function() {
        // Here we preload the assets
        game.load.image('test_cat', 'assets/sprites/test_cat.png');

        // tilesets
        game.load.tilemap('tilemap', 'assets/test_map3.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/sprites/tileset.png');
        game.load.spritesheet('cat', 'assets/sprites/cat.png', 16, 16);
        game.load.spritesheet('bird', 'assets/sprites/bird.png', 16, 16);
        game.load.spritesheet('bowls', 'assets/sprites/bowls.png', 16, 16);
        game.load.spritesheet('bed', 'assets/sprites/bed.png', 16, 16);
        game.load.spritesheet('down', 'assets/sprites/down.png', 16, 16);
        game.load.image('title', 'assets/sprites/title.png');

        // sounds
        game.load.audio('mainTheme', 'assets/sound/meowschief.ogg');

        // game scaling
        game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        game.scale.setUserScale(3, 3);

        game.renderer.renderSession.roundPixels = true;
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
    },

    create: function() {
        // basic state control
        this.state = 'start';

        // Here we create the game
        // Set the background color to blue
        game.stage.backgroundColor = '#A9DBD8';

        // Start the Arcade physics system (for movements and collisions)
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.ready = false;
        this.map = game.add.tilemap('tilemap');
        this.map.addTilesetImage('test_tileset', 'tiles');

        this.backgroundLayer1 = this.map.createLayer('Background1');
        this.backgroundLayer2 = this.map.createLayer('Background2');
        this.collisionLayer = this.map.createLayer('Collision');
        this.trapLayer = this.map.createLayer('Trap');
        this.startLayer = this.map.createLayer('Start');

        //Before you can use the collide function you need to set what tiles can collide
        this.map.setCollisionBetween(1, 200, true, 'Collision');
        this.map.setCollisionBetween(1, 100, true, 'Trap');

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

        this.bed = game.add.sprite(128, 176, 'bed', 0);
        this.player = game.add.sprite(150, 192, 'cat', 10);
        this.player.animations.add(cat.STATES.sleep, [0, 1, 2, 3, 4]);
        this.player.animations.add(cat.STATES.lay, [5, 6, 7, 8, 9]);
        this.player.animations.add(cat.STATES.sit, [10, 11, 12, 13, 14]);
        this.player.animations.add(cat.STATES.lick, [15, 16, 17, 18, 19]);
        this.player.animations.add(cat.STATES.stand, [20, 21, 22, 23, 24]);
        this.player.animations.add(cat.STATES.move, [25, 26, 27, 28, 29]);
        this.player.animations.add(cat.STATES.jump, [30, 31, 32, 33, 34]);
        this.player.anchor.setTo(.5,.5);

        // Make a sprite a bit higher than player for the camera to follow
        // in the start screen.
        this.fairy = game.add.sprite(170, 80);
        this.water = game.add.sprite(32, 190, 'bowls', 0);
        this.food = game.add.sprite(48, 190, 'bowls', 1);
        this.bedfront = game.add.sprite(128, 176, 'bed', 1);

        this.indicator = game.add.sprite(128, 160, 'down', 0);
        this.indicator.visible = false;
        game.add.tween(this.indicator)
            .to({y: this.indicator.y + 3, alpha: 0},
                2000, Phaser.Easing.Linear.None, true, 0, 0)
            .loop(true);

        this.birdseed = game.add.sprite(0, 0, 'bird', 5);
        this.birdseed.ready = true;

        this.birds = game.add.group();

        this.title = game.add.sprite(32, 64, 'title');
        this.title.alpha = 0;
        game.add.tween(this.title).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 0)
            .onComplete.addOnce(() => { this.canPlay = true; });

        game.physics.arcade.enable(this.player);
        game.physics.arcade.enable(this.birdseed);
        game.physics.arcade.enable(this.water);
        game.physics.arcade.enable(this.food);
        game.physics.arcade.enable(this.bed);

        // sound
        this.mainTheme = game.add.audio('mainTheme');

        // camera
        game.camera.setPosition(0, 60);
        game.camera.follow(this.fairy, Phaser.Camera.FOLLOW_PLATFORMER, 0.1, 0.1);

        // Add gravity to make it fall
        this.player.body.gravity.y = 600;
        this.birdseed.body.gravity.y = 600;
        this.water.body.gravity.y = 600;
        this.food.body.gravity.y = 600;

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
        game.physics.arcade.collide(this.birdseed, this.collisionLayer);
        game.physics.arcade.collide(this.food, this.collisionLayer);
        game.physics.arcade.collide(this.water, this.collisionLayer);
        game.physics.arcade.collide(this.food, this.trapLayer);
        game.physics.arcade.collide(this.water, this.trapLayer);
        game.physics.arcade.collide(this.player, this.trapLayer, this.hideTrap, null, this);
        game.physics.arcade.overlap(this.player, this.bed, this.checkWin, null, this);

        if (cat.state >= cat.STATES.stand) {
            game.physics.arcade.overlap(this.player, this.birds, this.killBird, null, this);
        }

        // only do these things while we are playing
        if (this.state === 'play') {
            this.checkSpawnBird(now);
            this.checkObedience(now);

            this.checkKeys(now);
            this.moveCat(now);
        }
        else {
            this.player.animations.play(cat.STATES.sit, cat.STATES.sit + 1, true);
            this.checkKeys(now);
            if (this.keyCheck.up && this.canPlay) {
                game.add.tween(this.title).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 0);
                this.state = 'play';
            }
        }

        if (!this.food.body.blocked.down) {
            this.food.angle += 4;
        }

        if (!this.water.body.blocked.down) {
            this.water.angle -= 4;
        }
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

        if (!this.ready) {
            this.fairy.x = this.player.x;
            this.fairy.y = this.player.y - 80;
        }
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
        if (!this.ready) return;
        this.lastBirdSpawn = this.lastBirdSpawn || now;

        if (this.birdseed.ready) {
            this.birdseed.x = 0;
            this.birdseed.y = 0;
        }

        if (now - this.lastBirdSpawn > 5000) {
            if (this.birdseed.ready) {
                var dirX = Math.random() > 0.5 ? -1 : 1;
                var randX = Math.floor(Math.random() * 80) + 50;

                this.birdseed.x = this.player.x + (randX * dirX);
                this.birdseed.y = this.player.y - 200;
                this.birdseed.ready = false;
                this.lastBirdSpawn = now;
            }
        }

        if (!this.birdseed.ready && this.birdseed.body.blocked.down) {
            this.spawnBird(this.player, this.birdseed.x, this.birdseed.y + 8);
            this.birdseed.ready = true;
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
            8000, Phaser.Easing.Linear.In, true, 0, 0);
        tween.onComplete.addOnce(() => {
            game.physics.arcade.enable(bird);
            bird.body.gravity.y = 100;
            bird.animations.play('rest', 1, true);
        });
        return bird;
    },

    killBird(player, bird) {
        if (bird.dead) return;
        bird.dead = true;
        bird.animations.play('dead', 1, true);
        bird.animations.stop();
        bird.y -= 3;
        bird.body.gravity.y = 600;
        cat.obedient = false;
    },

    hideTrap() {
        if (this.ready) return;
        this.indicator.visible = true;
        this.map.setCollisionBetween(1, 100, false, 'Trap');
        this.trapLayer.visible = false;
        this.startLayer.visible = false;
        this.camera.shake(0.01, 500);
        this.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER, 0.1, 0.1);
        this.ready = true;

        game.add.tween(this.food).to({ alpha: 0 },
            1000, Phaser.Easing.Linear.In, true, 0, 0);
        game.add.tween(this.water).to({ alpha: 0 },
            1000, Phaser.Easing.Linear.In, true, 0, 0);
        game.add.tween(this.indicator).to({y: this.indicator.y - 5},
            2000, Phaser.Easing.Linear.None, true, 0, 0).loop(true);

        // prevent cat from auto-jumping away from trap
        setTimeout(() => {
            CAT_TREATS = false;
            cat.obedient = false;
        }, 10);

        // set a timer to start the music
        setTimeout(() => {
            if (!this.mainTheme.isPlaying) {
                this.mainTheme.loopFull();
            }
        }, 1700);
    },

    checkWin() {
        if (!this.ready) return;
        if (cat.state !== cat.STATES.sleep) return;
        var deltaBed = Math.abs(this.player.x - this.bed.x);
        if (!(deltaBed < 12 && deltaBed > 4)) return;
        console.log('Win~', this.player.x, this.bed.x);
    }
};
