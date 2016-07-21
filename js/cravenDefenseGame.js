CravenDefense.Game = function () {
    this.startTimer = Phaser.Timer.SECOND * 1;

    this.score = 0;
    this.scoreText = null;
    
    this.lives = 0;
    this.livesText = null;    
    
    this.money = 0;
    this.moneyText = null;
    
    this.killTexts = null;
    
    this.textStyle = { font: "18px Arial", fill: "#0095DD" };
    this.textStyle2 = { font: "18px Arial", fill: "#000000" };
    
    this.waveDist = [ { type: "monster1", amount: 1, monsterInterval: 2000, waveInterval: 5000 }, 
                      { type: "monster2", amount: 3, monsterInterval: 2000, waveInterval: 5000 }, 
                      { type: "monster3", amount: 3, monsterInterval: 1000, waveInterval: 5000 }, 
                      { type: "monster4", amount: 3, monsterInterval: 2000, waveInterval: 5000 },
                      { type: "monster1", amount: 1, monsterInterval: 3000, waveInterval: 5000 }, 
                      { type: "monster2", amount: 1, monsterInterval: 3000, waveInterval: 5000 }, 
                      { type: "monster3", amount: 1, monsterInterval: 3000, waveInterval: 5000 }, 
                      { type: "monster4", amount: 1, monsterInterval: 2000, waveInterval: 5000 }                      
    ];
    this.wavesTotal = this.waveDist.length - 1;
    this.waveCount = 0;
    this.waveMonsterCount = 0;
    this.currentWave = this.waveDist[0];
    this.waveText = null;
    
    this.monsters = null;
    
    this.turrets = null;
    
    this.TurretStore = {};
    this.TurretStore.turrets = null;
    
    this.explosions = null;   
    this.lasers = null; 
    this.bullets = null;
    this.scatterShots = null;

    // Map
    this.bmd = null;
    this.points = {
        "x": [ 0, 32, 128, 256, 384, 512, 608, 800, 850 ],
        "y": [ 200, 240, 240, 240, 240, 240, 240, 240, 240 ]
    };
    this.path = [];
    
    this.pauseKey = null;
    this.debugKey = null;
    this.showDebug = false;
};

CravenDefense.Game.prototype = {
    
    init: function (data) {
        // Player Data
        this.player1 = data.players[0];
        this.score = this.player1.score;
        this.lives = this.player1.lives;
        this.money = this.player1.money
        
        // Turret Data
        this.turretTypes = data.turrets;
        // this.test = new TurretStore(this.game);
        
        // Monster Data
        this.monsterTypes = data.monsters;

        this.waveCount = 0;
    },
    
    preload: function () {
        this.load.path = "assets/";
    },  
      
    create: function () {        
        /******* HUD *********/
        this.add.image(0, 0, "background");
        this.livesText = this.add.text(5, 5, "Lives: "+ this.lives, this.textStyle);
        this.moneyText = this.add.text(5, 25, "Money: "+ this.money, this.textStyle);
        
        this.scoreText = this.add.text(this.world.width / 2, 5, "Score: " + this.score, this.textStyle);
        this.waveText = this.add.text(this.world.width - 90, 5, "Wave: "+ (this.waveCount + 1) + "/" + (this.wavesTotal + 1), this.textStyle);
        
        this.killTexts = this.add.group();
        var text = this.add.text(0, 0, "Kill", this.textStyle2, this.killTexts);
        text.alpha = 0;
        text.alive = false;
        
        /******* Turret Store *********/
        this.TurretStore.turrets = this.add.group();
        var storeTurret = this.add.sprite(this.world.width - 50, 50, "turret1");
        storeTurret.anchor.set(0.5,0.5);
        this.physics.enable(storeTurret, Phaser.Physics.ARCADE);
        storeTurret.body.immovable = true;
        storeTurret.name = this.turretTypes[0].name;
        storeTurret.weapon = this.turretTypes[0].weapon;
        storeTurret.cost = this.turretTypes[0].cost;
        storeTurret.body.allowRotation = false;
        storeTurret.inputEnabled = true;
        storeTurret.input.enableDrag();
        storeTurret.originalPosition = storeTurret.position.clone();
        storeTurret.events.onDragStart.add(this.onDragStart, this);
        storeTurret.events.onDragStop.add(this.onDragStop, this);
        
        this.TurretStore.turrets.add(storeTurret);
        
        storeTurret = this.add.sprite(this.world.width - 50, 75, "turret2");
        storeTurret.anchor.set(0.5,0.5);
        this.physics.enable(storeTurret, Phaser.Physics.ARCADE);
        storeTurret.body.immovable = true;       
        storeTurret.name = this.turretTypes[1].name;
        storeTurret.weapon = this.turretTypes[1].weapon;
        storeTurret.cost = this.turretTypes[1].cost;
        storeTurret.body.allowRotation = false;
        storeTurret.inputEnabled = true;
        storeTurret.input.enableDrag();
        storeTurret.originalPosition = storeTurret.position.clone();
        storeTurret.events.onDragStart.add(this.onDragStart, this);
        storeTurret.events.onDragStop.add(this.onDragStop, this);    
        
        this.TurretStore.turrets.add(storeTurret);    
        
        storeTurret = this.add.sprite(this.world.width - 50, 100, "turret3");
        storeTurret.anchor.set(0.5,0.5);
        this.physics.enable(storeTurret, Phaser.Physics.ARCADE);
        storeTurret.body.immovable = true;       
        storeTurret.name = this.turretTypes[2].name;
        storeTurret.weapon = this.turretTypes[2].weapon;
        storeTurret.cost = this.turretTypes[2].cost;
        storeTurret.body.allowRotation = false;
        storeTurret.inputEnabled = true;
        storeTurret.input.enableDrag();
        storeTurret.originalPosition = storeTurret.position.clone();
        storeTurret.events.onDragStart.add(this.onDragStart, this);
        storeTurret.events.onDragStop.add(this.onDragStop, this);    
        
        this.TurretStore.turrets.add(storeTurret);          
            
        /******* Monsters *********/
        this.monsters = this.add.group();
        
        for(var w = 0; w < this.waveDist.length; w++) {
            
            for(var wc = 0; wc < this.waveDist[w].amount; wc++) {
                var type = this.waveDist[w].type;
                var mTypeObj = this.getObjectByKeyValue(this.monsterTypes, "type", "monster3"); 
                var m = this.add.sprite(0, 0, type);
                
                this.physics.arcade.enable(m);
                m.anchor.set(0.5);
                m.body.immovable = true;
                m.checkWorldBounds = true;
                m.events.onOutOfBounds.add(this.monsterLeaveScreen, this);
                m.pi = mTypeObj.pi;
                m.health = mTypeObj.health;
                m.maxHealth = mTypeObj.health;
                m.speed = mTypeObj.speed;                
                m.alive = false;
                m.type = mTypeObj;
                m.visible = false;
                this.monsters.add(m);
                
            }
            
        }
        
        this.time.events.add(this.startTimer, this.releaseMonster, this);

        /******* Turrets *********/
        this.turrets = this.add.group();
        
        /******* Weapons *********/
        this.bullets = this.add.group();
        this.lasers = this.add.group();
        this.scatterShots = this.add.group();
        
        // Explosion - http://phaser.io/tutorials/coding-tips-007
        this.explosions = this.add.group();
        this.explosions.createMultiple(30, "kaboom");
        this.explosions.forEach(this.setupExplosion, this);

        /******* Map *********/
        this.bmd = this.add.bitmapData(this.game.width, this.game.height);
        this.bmd.addToWorld();

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
        this.physics.arcade.overlap(this.scatterShots, this.monsters, this.collisionHandler, null, this);
        
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
        if(this.player1.money <= sprite.cost) return false;
    },
    
    onDragStop: function (sprite, pointer) {

        var turret = this.game.add.sprite(pointer.x, pointer.y, sprite.key, sprite.frame);
        turret.anchor.set(0.5,0.5);
        turret.name = sprite.name;
        
        switch(sprite.weapon) {
            case "ScatterShot":
            
                turret.weapon = new Weapon.ScatterShot(this.game);
                this.scatterShots.add(turret.weapon); 
                       
                break;         
            case "Beam":
            
                turret.weapon = new Weapon.Beam(this.game);
                this.lasers.add(turret.weapon); 
                       
                break;                         
            default:
            case "SingleBullet":
            
                turret.weapon = new Weapon.SingleBullet(this.game);
                this.bullets.add(turret.weapon);  
                          
                break;
        }
            
        this.turrets.add(turret);
        
        sprite.position.copyFrom(sprite.originalPosition);
        
    },
  
    releaseMonster: function() {

        if(this.waveCount > this.wavesTotal) return;

        var currentWave = this.waveDist[this.waveCount];

        this.waveText.text = "Wave: " + (this.waveCount + 1) + "/" + (this.wavesTotal + 1);
        
        if(this.waveMonsterCount === currentWave.amount) {
            this.waveMonsterCount = 0;
            this.waveCount++;

            return;

        }
        
        var monster = this.monsters.getFirstDead(true, 0, this.world.height/3, currentWave.type);
        monster.pi = 0;
        monster.health = monster.maxHealth;

        this.time.events.add(currentWave.monsterInterval, this.releaseMonster, this);
        
        this.waveMonsterCount++;

    },

    releaseWave : function (interval, callback) {

        this.time.events.add(interval, callback, this);

    },
    
    monsterLeaveScreen: function (monster) {
        monster.kill();
        
        this.lives--;
        
        if(this.lives) {
            this.livesText.text = "Lives: " + this.lives;
        }
        else {
            alert("You lost, game over!");
            location.reload();
        }
    },
    
    findTarget: function (turret) {

        var monsterCount = this.monsters.countLiving();

        for (var i = 0; i < monsterCount; i++) {
            var monster = this.monsters.children[i];
            
            if (this.physics.arcade.distanceBetween(turret, monster) < turret.weapon.range) {
                turret.rotation = this.physics.arcade.angleBetween(turret, monster);
                
                turret.weapon.fire(turret, monster);

                return;
            }
            
        }

    },
    
    setupExplosion : function (monster) {
        
        monster.anchor.x = 0.5;
        monster.anchor.y = 0.5;
        monster.animations.add("kaboom");        
    
    },
    
    collisionHandler : function  (bullet, monster) {
        var bulletType = bullet.parent.name,
            text = this.killTexts.getFirstDead(false);
        
        bullet.kill();
        
        monster.damage(10);
        
        // Impact
        // Todo: Add impact to Weapon factory
        switch(bulletType) {
            case "ScatterShot":
            
            break;
            case "Beam":
            
            var explosion = this.explosions.getFirstExists(false);
                explosion.reset(monster.body.x, monster.body.y);
                explosion.play("kaboom", 30, false, true);   
                         
            break;            
            default:
            case "SingleBullet":
            
            break;                        
        }
        
        if(!monster.alive) {
            //  Increase the score
            this.score += 20;
            this.scoreText.text = "Score: " + this.score;
            
            this.money += 25;
            this.moneyText.text = "Money: " + this.money;  
            
            if(!text) {
                
                text = this.add.text(monster.x, monster.y, "Kill", this.textStyle2, this.killTexts);
                text.anchor.set(0.5);
                this.add.tween(text).to( { alpha: 0 }, 500, "Linear", true);
                
            } else {
                
                text.text = "kill";
                text.alpha = 1;
                text.x = monster.x;
                text.y = monster.y;
                text.anchor.set(0.5);
                this.add.tween(text).to( { alpha: 0 }, 500, "Linear", true);  
                              
            }

            if(this.waveCount === this.wavesTotal) {
                text = this.add.text(this.world.width / 2, this.world.height / 2, "Final Wave", this.textStyle2);
                text.anchor.set(0.5);
                this.add.tween(text).to( { alpha: 0 }, 2000, "Linear", true);
            }

            this.releaseWave(this.currentWave.waveInterval, this.releaseMonster);
            
            return;
        }  
        
        if(!text) {
            
            text = this.add.text(monster.x, monster.y, monster.health + "/" + monster.maxHealth, this.textStyle2, this.killTexts);
            text.anchor.set(0.5);
            this.add.tween(text).to( { alpha: 0 }, 500, "Linear", true);
            
        } else {
            
            text.text = monster.health + "/" + monster.maxHealth;
            text.alpha = 1;
            text.x = monster.x;
            text.y = monster.y;
            text.anchor.set(0.5);
            this.add.tween(text).to( { alpha: 0 }, 500, "Linear", true);  
                            
        }       

    }, 
    
    gameOver: function () {

        if (this.monsters.countLiving() === 0 && this.waveCount === this.waveDist.length) {
            this.score += 1000;
            this.scoreText.text = "Score: " + this.score;

            this.money += 200;
            this.moneyText.text = "Money: " + this.money;
            
            alert("You won the game, congratulations!");
            this.state.start("CravenDefense.Preloader");
        }

    },

    plot: function () {

        this.bmd.clear();

        var x = 1 / game.width,
            ix = 0;

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
            
            this.bmd.rect(px, py, 1, 1, "rgba(255, 255, 255, 1)");
        }

        for (var p = 0; p < this.points.x.length; p++)
        {
            this.bmd.rect(this.points.x[p]-3, this.points.y[p]-3, 6, 6, "rgba(255, 0, 0, 1)");
        }

    },

    moveMonster: function (monster) {
        monster.x = this.path[monster.pi].x;
        monster.y = this.path[monster.pi].y;
        monster.rotation = this.path[monster.pi].angle;
        
        monster.pi++;

        if (monster.pi >= this.path.length)
        {
            monster.pi = 0;
        }

    },
    
    getObjectByKeyValue(obj, key, value) {
        
        for (var i in obj) {
            if (obj.hasOwnProperty(i) && typeof(i) !== 'function') {
                if(obj[i]["type"] === value) return obj[i];
            }
        }
        
    }
    
};
