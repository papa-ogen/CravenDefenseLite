var CravenDefense = {
    MONSTER1_SPRITE : 'monster1'
};

CravenDefense.Preloader = function() {};

CravenDefense.Preloader.prototype = {
    init: function () {
        this.input.maxPointers = 1;
        this.scale.pageAlignHorizontally = true;
    },

    preload: function () {
        this.load.path = 'assets/images/';
        this.load.images([ 'background', 'monster1', 'monster2', 'monster3', 'monster4', 'turret1', 'turret2', 'turret3', 'bullet' ]);

        this.load.spritesheet('wobble', 'wobble.png', 60, 20);
        this.load.spritesheet('button', 'button.png', 120, 40);
        this.load.spritesheet('kaboom', 'explode.png', 128, 128);
        this.load.spritesheet('laser', 'rgblaser.png', 4, 4);
    },

    create: function () {
        // var startButton = this.add.button(this.world.width*0.5, this.world.height*0.5, 'button', this.start, this, 1, 0, 2);
        // startButton.anchor.set(0.5);
        
        this.input.onDown.addOnce(this.start, this);
    },
    start: function () {
        this.state.start('CravenDefense.Game');
    }
};

CravenDefense.Game = function () {
    this.startTimer = Phaser.Timer.SECOND * 1;

    this.score = 0;
    this.scoreText = null;
    
    this.lives = 10;
    this.livesText = null;    
    
    this.money = 100;
    this.moneyText = null;
    
    this.textStyle = { font: '18px Arial', fill: '#0095DD' };
    
    this.waveDist = [ { type: 'monster1', amount: 3 }, 
                      { type: 'monster2', amount: 3 }, 
                      { type: 'monster3', amount: 3 }, 
                      { type: 'monster4', amount: 3 },
                      { type: 'monster1', amount: 1 }, 
                      { type: 'monster2', amount: 1 }, 
                      { type: 'monster3', amount: 1 }, 
                      { type: 'monster4', amount: 1 }                      
    ];
    this.waveCount = 0;
    this.waveMonsterCount = 0;
    this.waveText = null;
    
    this.monsters = null;
    this.monsterSpeed = 150;
    this.monsterReleaseRate = 1000;
    
    this.turrets = null;
    this.turretFireRate = 500;
    this.turretLastShot = null;
    this.turretRange = 200;
    
    this.TurretStore = {};
    this.TurretStore.turrets = null;
    
    this.bullets = null;
    this.explosions = null;   
    this.lasers = null; 

    // Map
    this.bmd = null;
    this.points = {
        'x': [ 0, 32, 128, 256, 384, 512, 608, 800 ],
        'y': [ 200, 240, 240, 240, 240, 240, 240, 240 ]
    };
    this.path = [];
    
    this.pauseKey = null;
    this.debugKey = null;
    this.showDebug = false;
};

CravenDefense.Game.prototype = {
    
    init: function () {
        this.score = 0;
        this.lives = 10;

        this.waveCount = 0;
    },
    
    preload: function () {
        this.load.path = 'assets/';
    },  
      
    create: function () {
        /******* HUD *********/
        this.add.image(0, 0, 'background');
        this.livesText = this.add.text(5, 5, 'Lives: '+ this.lives, this.textStyle);
        this.moneyText = this.add.text(5, 25, 'Money: '+ this.money, this.textStyle);
        
        this.scoreText = this.add.text(this.world.width / 2, 5, 'Score: ' + this.score, this.textStyle);
        this.waveText = this.add.text(this.world.width - 80, 5, 'Wave: '+ this.waveCount, this.textStyle);

        /******* Turret Store *********/
        this.TurretStore.turrets = this.add.group();
        var storeTurret = this.add.sprite(this.world.width - 50, 50, 'turret1');
        storeTurret.anchor.set(0.5,0.5);
        this.physics.enable(storeTurret, Phaser.Physics.ARCADE);
        storeTurret.body.immovable = true;       
        storeTurret.name = "turret1";
        storeTurret.fireRate = 1000;
        storeTurret.lastShot = null;
        storeTurret.range = 500;
        storeTurret.body.allowRotation = false;
        storeTurret.inputEnabled = true;
        storeTurret.input.enableDrag();
        storeTurret.originalPosition = storeTurret.position.clone();
        storeTurret.events.onDragStart.add(this.onDragStart, this);
        storeTurret.events.onDragStop.add(this.onDragStop, this);
        
        this.TurretStore.turrets.add(storeTurret);
        
        storeTurret = this.add.sprite(this.world.width - 50, 75, 'turret2');
        storeTurret.anchor.set(0.5,0.5);
        this.physics.enable(storeTurret, Phaser.Physics.ARCADE);
        storeTurret.body.immovable = true;       
        storeTurret.name = "turret2";
        storeTurret.fireRate = 500;
        storeTurret.lastShot = null;
        storeTurret.range = 200;
        storeTurret.body.allowRotation = false;
        storeTurret.inputEnabled = true;
        storeTurret.input.enableDrag();
        storeTurret.originalPosition = storeTurret.position.clone();
        storeTurret.events.onDragStart.add(this.onDragStart, this);
        storeTurret.events.onDragStop.add(this.onDragStop, this);    
        
        this.TurretStore.turrets.add(storeTurret);    
            
        /******* Monsters *********/
        this.monsters = this.add.group();
        
        this.time.events.add(this.startTimer, this.releaseMonster, this);

        /******* Turrets *********/
        this.turrets = this.add.group();
        
        /******* Bullets and Stuff *********/
        this.bullets = this.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

        this.bullets.createMultiple(50, 'bullet');
        this.bullets.setAll('checkWorldBounds', true);
        this.bullets.setAll('outOfBoundsKill', true);
        
        // Explosion - http://phaser.io/tutorials/coding-tips-007
        this.explosions = this.add.group();
        this.explosions.createMultiple(30, 'kaboom');
        this.explosions.forEach(this.setupExplosion, this);
        
        // Laser
        this.lasers = this.add.group();

        /******* Map *********/
        this.bmd = this.add.bitmapData(this.game.width, this.game.height);
        this.bmd.addToWorld();

        var py = this.points.y;

        for (var i = 0; i < py.length; i++)
        {
            py[i] = this.rnd.between(32, 432);
        }

        this.plot();
        
        //  Press P to pause and resume the game
        this.pauseKey = this.input.keyboard.addKey(Phaser.Keyboard.P);
        this.pauseKey.onDown.add(this.togglePause, this);

        //  Press D to toggle the debug display
        this.debugKey = this.input.keyboard.addKey(Phaser.Keyboard.D);
        this.debugKey.onDown.add(this.toggleDebug, this);

    },
    
    update: function () {
        this.monsters.forEachAlive(this.moveMonster, this);

        this.turrets.forEachAlive(this.findTarget, this);      
        
        this.physics.arcade.overlap(this.bullets, this.monsters, this.collisionHandler, null, this);
        this.physics.arcade.overlap(this.lasers, this.monsters, this.collisionHandler, null, this);
        
        this.gameOver();
          
    },
    
    render: function () {

        if (this.showDebug)
        {
            this.game.debug.body(this.turrets);
            this.monsters.forEachAlive(this.renderBody, this);
             
             this.game.debug.text("Monsters: " + this.monsters.countLiving(), 600, 32);
             this.game.debug.text("Turrets: " + this.turrets.countLiving(), 600, 64);
        }     
            
    },
    
    renderBody: function (sprite) { this.game.debug.body(sprite); },
    
    togglePause: function () { this.game.paused = !this.game.paused; },

    toggleDebug: function () { this.showDebug = !this.showDebug; },
    
    onDragStart: function (sprite, pointer) {

    },
    
    onDragStop: function (sprite, pointer) {

        var turret = this.game.add.sprite(pointer.x, pointer.y, sprite.key, sprite.frame);
        turret.anchor.set(0.5,0.5);
        turret.name = sprite.name;
        turret.lastShot = sprite.lastShot;
        turret.range = sprite.range;  
            
        if (sprite.name === "turret1") {
            
            turret.fireRate = sprite.fireRate;
                  
        } else if (sprite.name === "turret2") {
            
            turret.weapon = game.add.weapon(40, 'laser');
            turret.weapon.setBulletFrames(0, 80, true);
            turret.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
            turret.weapon.bulletSpeed = 400;
            turret.weapon.fireRate = sprite.fireRate;
            turret.weapon.trackSprite(turret, 0, 0, true);
            
            // this.lasers.add(turret.weapon);
        }
        
        this.turrets.add(turret);
        
        sprite.position.copyFrom(sprite.originalPosition);
        
    },
  
    releaseMonster: function() {
        
        if(this.waveMonsterCount == this.waveDist[this.waveCount].amount) {
            this.waveMonsterCount = 0;
            this.waveCount++;
            this.waveText.text = "Wave: " + this.waveCount;
        }
        
        if(this.waveCount === this.waveDist.length) return;
        
        var wave = this.waveDist[this.waveCount];
        
        var monster = this.monsters.getFirstDead(true, 0, this.world.height/3, wave.type);
        
        this.physics.arcade.enable(monster);
        monster.anchor.set(0.5);
        monster.body.immovable = true;
        monster.body.velocity.x = this.monsterSpeed;
        monster.checkWorldBounds = true;
        monster.events.onOutOfBounds.add(this.monsterLeaveScreen, this);
        monster.pi = 0;
       
        this.time.events.add(this.monsterReleaseRate, this.releaseMonster, this);
        
        this.waveMonsterCount++;

    },
    
    monsterLeaveScreen: function (monster) {
        monster.kill();
        
        this.lives--;
        
        if(this.lives) {
            this.livesText.text = "Lives: " + this.lives;
        }
        else {
            alert('You lost, game over!');
            location.reload();
        }
    },
    
    findTarget: function (turret) {

        var monsterCount = this.monsters.countLiving();

        for(var i = 0; i < monsterCount; i++) {
            var monster = this.monsters.children[i];
            if (this.physics.arcade.distanceBetween(turret, monster) < this.turretRange) {
                turret.rotation = this.physics.arcade.angleBetween(turret, monster);

                if (turret.name === "turret1") {
                    this.fireTurret(turret, monster);
                    return; 
                } else if (turret.name === "turret2") {
                    turret.weapon.fire();
                }
            }            
        }

    },
    
    fireTurret: function (turret, monster) {

        //  To avoid them being allowed to fire too fast we set a time limit
        if (this.time.now > turret.lastShot)
        {
            //  Grab the first bullet we can from the pool
            var bullet = this.bullets.getFirstExists(false);

            if (bullet)
            {
                //  And fire it
                bullet.reset(turret.x-5, turret.y -5);
                this.physics.arcade.moveToObject(bullet, monster, 400);
                turret.lastShot = this.time.now + turret.fireRate;
            }
        }

    },
    
    setupExplosion : function (monster) {
        
        monster.anchor.x = 0.5;
        monster.anchor.y = 0.5;
        monster.animations.add('kaboom');        
    
    },
    
    collisionHandler : function  (bullet, monster) {

        //  When a bullet hits an alien we kill them both
        bullet.kill();
        monster.kill();

        //  Increase the score
        this.score += 20;
        this.scoreText.text = "Score: " + this.score;
        
        this.money += 25;
        this.moneyText.text = "Money: " + this.money;        

        //  And create an explosion :)
        var explosion = this.explosions.getFirstExists(false);
            explosion.reset(monster.body.x, monster.body.y);
            explosion.play('kaboom', 30, false, true);

        if (this.monsters.countLiving() == 0 && this.waveCount === this.waveDist.length)
        {
            this.score += 1000;
            this.scoreText.text = "Score: " + this.score;

            this.money += 200;
            this.moneyText.text = "Money: " + this.money;


            this.gameOver();
        }

    }, 
    
    resetBullet: function (bullet) {
        //  Called if the bullet goes out of the screen
        bullet.kill();

    },
    
    gameOver: function () {

        if (this.monsters.countLiving() === 0 && this.waveCount === this.waveDist.length) {
            alert('You won the game, congratulations!');
            this.state.start('CravenDefense.Preloader');
        }

    },

    plot: function () {

        this.bmd.clear();

        var x = 1 / game.width,
            ix;

        for (var i = 0; i <= 1; i += x)
        {
            var px = this.math.catmullRomInterpolation(this.points.x, i);
            var py = this.math.catmullRomInterpolation(this.points.y, i);

            var node = { x: px, y: py, angle: 0 };

            if (ix > 0)
            {
                node.angle = this.math.angleBetweenPoints(this.path[ix - 1], node);
            }

            this.path.push(node);
            
            ix++;
            
            this.bmd.rect(px, py, 1, 1, 'rgba(255, 255, 255, 1)');
        }

        for (var p = 0; p < this.points.x.length; p++)
        {
            this.bmd.rect(this.points.x[p]-3, this.points.y[p]-3, 6, 6, 'rgba(255, 0, 0, 1)');
        }

    },

    moveMonster: function (monster) {
// https://github.com/photonstorm/phaser-coding-tips/blob/master/issue-008/face.html
        monster.x = this.path[monster.pi].x;
        monster.y = this.path[monster.pi].y;
        monster.rotation = this.path[monster.pi].angle;
        
        monster.pi++;

        if (monster.pi >= this.path.length)
        {
            monster.pi = 0;
        }

    }
    
};

var game = new Phaser.Game(800, 595, Phaser.AUTO, 'game');

game.state.add('CravenDefense.Preloader', CravenDefense.Preloader);
game.state.add('CravenDefense.Game', CravenDefense.Game);

game.state.start('CravenDefense.Preloader');