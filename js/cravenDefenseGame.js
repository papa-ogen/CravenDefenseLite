CravenDefense.Game = function () {
    
    this.startTimer = Phaser.Timer.SECOND * 1;
    
    this.path = [];
    this.pathfinding = null;
    this.map = null;
    this.layer = null;

    this.score = 0;
    this.scoreText = null;
    
    this.lives = 0;
    this.livesText = null;    
    
    this.money = 0;
    this.moneyText = null;
    
    this.killTexts = null;
    
    this.textStyle = { font: "18px Arial", fill: "#ffffff" };
    this.textStyle2 = { font: "18px Arial", fill: "#000000" };
    
    this.currentStage = null;
    this.wavesTotal = null;
    this.waveCount = null;
    this.waveMonsterCount = null;
    this.currentWave = null;
    this.waveText = null;
    
    this.monsters = null;
    
    this.turrets = null;
    
    this.store = {};
    this.store.turrets = null;
    this.store.monsters = null;
    
    this.lasers = null; 
    this.bullets = null;
    this.scatterShots = null;

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
        
        // Monster Data
        this.monsterTypes = data.monsters;
        
        // Stages Data
        this.stages = data.stages;
        this.currentStage = 1;
        this.currentStageData = this.stages[0];
        this.currentStageWaves = this.currentStageData.waves;
        this.currentStageWavesTotal = this.currentStageData.waves.length;
        this.currentWave = 1;
        this.currentWaveData = this.currentStageData.waves[this.currentWave-1];
        this.currentWaveMonsterCount = 1;
        this.waveCount = 1;
        
    },
    
    preload: function () {
        
        // this.load.path = "assets/";
        
    },  
      
    create: function () {       
        
        /******* Map *********/
        this.map = this.add.tilemap("stage1");
        this.map.addTilesetImage('grass-tiles-2-small', 'tiles');
        this.map.addTilesetImage("plant repack", "trees");

        this.layer = this.map.createLayer('Background');
        this.layer2 = this.map.createLayer("Trees");
        this.layer3 = this.map.createLayer("Trees2");
        this.path = this.map.createLayer('Path');

        // var tile_dimensions = new Phaser.Point(this.map.tileWidth, this.map.tileHeight);
        // this.pathfinding = this.plugins.add(CravenDefense.Path, this.path.data, [-1], tile_dimensions);     
        
           
        
        /******* HUD *********/
        // https://gamedevacademy.org/how-to-create-a-game-hud-plugin-in-phaser/
        this.livesText = this.add.text(5, 5, "Lives: "+ this.lives, this.textStyle);
        this.moneyText = this.add.text(5, 25, "Money: "+ this.money, this.textStyle);
        
        this.scoreText = this.add.text(this.world.width / 2, 5, "Score: " + this.score, this.textStyle);
        this.waveText = this.add.text(this.world.width - 90, 5, "Wave: "+ this.currentWave + "/" + this.currentStageWavesTotal, this.textStyle);
        
        this.killTexts = this.add.group();
        var text = this.add.text(0, 0, "Kill", this.textStyle2, this.killTexts);
        text.alpha = 0;
        text.alive = false;
        
        /******* Turret Store *********/
        this.store.turrets = new Store.Turrets(this.game, this.turretTypes);
        this.turrets = this.add.group();
        
        var y = 50;
        for(var st=0; st < this.store.turrets.children.length; st++) {
            
            var storeTurret = this.store.turrets.children[st];

            storeTurret.x = this.world.width - 50;
            storeTurret.y = y;

            // storeTurret.input.enableDrag();
            storeTurret.events.onDragStart.add(this.onDragStart, this);
            storeTurret.events.onDragStop.add(this.onDragStop, this);   

            y += 50;
        }

        /******* Monsters *********/
        // this.store.monsters = new Store.Monsters(this.game, this.monsterTypes);
        
        this.monsters = this.add.physicsGroup();
        this.monsters.createMultiple(10, "monster1", 0, false);
        this.monsters.setAll('maxHealth', 20);
        
        this.time.events.add(this.startTimer, this.releaseMonster, this);

        /******* Weapons *********/
        this.bullets = this.add.group();
        this.lasers = this.add.group();
        this.scatterShots = this.add.group(); 
        
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
             
             this.game.debug.text("Monsters: " + this.monsters.countLiving() + "/" + this.monsters.countDead(), 600, 32);
             this.game.debug.text("Turrets: " + this.turrets.countLiving() + "/" + this.turrets.countDead(), 600, 64);
        }     
            
    },
    
    renderBody: function (sprite) { this.game.debug.body(sprite); },
    
    togglePause: function () { this.game.paused = !this.game.paused; },

    toggleDebug: function () { this.showDebug = !this.showDebug; },
    
    onDragStart: function (sprite, pointer) {
        
        if(this.player1.money < sprite.cost) {
            // sprite.input.draggable = false;
        }
    },
    
    onDragStop: function (sprite, pointer) {

        switch(sprite.weapon) {
            case "ScatterShot":
            
                sprite.weapon = new Weapon.ScatterShot(this.game);
                this.scatterShots.add(sprite.weapon); 
                       
                break;         
            case "Beam":
            
                sprite.weapon = new Weapon.Beam(this.game);
                this.lasers.add(sprite.weapon); 
                       
                break;                         
            default:
            case "SingleBullet":
            
                sprite.weapon = new Weapon.SingleBullet(this.game);
                this.bullets.add(sprite.weapon);  
                          
                break;
        }
        
        sprite.x = pointer.x;
        sprite.y = pointer.y;
        
        sprite.input.draggable = false;
            
        this.turrets.add(sprite);
        
        this.player1.money -= sprite.cost;
        this.moneyText.text = "Money: " + this.player1.money;
        
    },
  
    releaseMonster: function() {
        
        if (this.currentStageWavesTotal < this.currentWave) return;

        if(this.currentWaveMonsterCount > this.currentWaveData.amount) {
            
            this.currentWave++;
            
            if(this.currentWave <= this.currentStageWavesTotal) {
            
                this.currentWaveData = this.currentStageData.waves[this.currentWave-1];
                this.currentWaveMonsterCount = 1;
            
            }
            
          return;  
          
        } 

        this.waveText.text = "Wave: " + this.currentWave + "/" + this.currentStageWavesTotal;
        
        if (this.currentWave === this.currentStageWavesTotal && this.currentWaveMonsterCount === 1) {
            
            var text = this.add.text(this.world.width / 2, this.world.height / 2, "Final Wave", this.textStyle2);
            text.anchor.set(0.5);
            this.add.tween(text).to( { alpha: 0 }, 2000, "Linear", true);
            
        }
        
        var monster = this.monsters.getFirstDead(true, 0, 0, this.currentWaveData.type);
        // var monster = this.monsters.getFirstDead(true, 0, 0, 'monster' + this.rnd.between(1, 4));
        
        if (monster) {
            
            // monster.reset();
            monster.body.velocity.x = 100;
            monster.health = monster.maxHealth;
            monster.x = 0;
            monster.y = 284;
            monster.events.onOutOfBounds.add(this.monsterLeaveScreen, this);   
            
        }

        this.time.events.add(this.currentWaveData.monsterInterval, this.releaseMonster, this);
        
        this.currentWaveMonsterCount++;

    },

    releaseWave : function (interval, callback) {

        this.time.events.add(interval, callback, this);

    },
    
    monsterLeaveScreen: function (monster) {
        
        monster.kill();
        
        this.lives--;
        
        if(this.lives <= 0) {
            this.livesText.text = "Lives: " + this.lives;
        }
        else {
            this.gameOver();
        }
        
        // check if any monsters left
        if(this.monsters.countLiving() === 0 && this.currentWave <= this.currentStageWavesTotal) {
            
            this.releaseWave(this.currentWaveData.waveInterval, this.releaseMonster);
            
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
    
    collisionHandler : function  (bullet, monster) {
        var text = this.killTexts.getFirstDead(false);
        
        bullet.kill();
        
        // Take Damage
        monster.damage(bullet.weapon.dmg);
        
        // Impact Effect
        bullet.weapon.impact(monster);
        
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

            this.releaseWave(this.currentWaveData.waveInterval, this.releaseMonster);
            
            return;
        }  
        
        if (!text) {
            
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

        if (this.monsters.countLiving() === 0 && this.currentWave > this.currentStageWavesTotal) {
            
            // Add slight delay
            this.time.events.add(Phaser.Timer.SECOND * 2, this.alertText, this);
            
        }

    },
    
    alertText: function () {
        
        this.score += 1000;
        this.scoreText.text = "Score: " + this.score;

        this.money += 200;
        this.moneyText.text = "Money: " + this.money;
        
        alert("Congratulations you won!");
        
        this.state.start("CravenDefense.Preloader");

    },

    moveMonster: function (monster) {

    var next_position, velocity;
    
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision);
    
    if (this.path.length > 0) {
        next_position = this.path[this.path_step];
 
        if (!this.reached_target_position(next_position)) {
            
            velocity = new Phaser.Point(next_position.x - monster.position.x,
                                   next_position.y - monster.position.y);
            velocity.normalize();
            monster.body.velocity.x = velocity.x * 100;
            monster.body.velocity.y = velocity.y * 100;
            
        } else {
            this.position.x = next_position.x;
            this.position.y = next_position.y;
            if (this.path_step < this.path.length - 1) {
                
                this.path_step += 1;
                
            } else {
                
                this.path = [];
                this.path_step = -1;
                monster.body.velocity.x = 0;
                monster.body.velocity.y = 0;
                
            }
        }
    }

    },
    
    getObjectByKeyValue: function (obj, key, value) {
        
        for (var i in obj) {
            if (obj.hasOwnProperty(i) && typeof(i) !== 'function') {
                if(obj[i]["type"] === value) return obj[i];
            }
        }
        
    }
    
};
