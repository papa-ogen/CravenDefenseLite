var CravenDefense = {
    AMOUNT_OF_MONSTERS: 10
};

CravenDefense.Preloader = function() {};

CravenDefense.Preloader.prototype = {
    init: function () {
        this.input.maxPointers = 1;
        this.scale.pageAlignHorizontally = true;
    },

    preload: function () {
        this.load.path = 'assets/images/';
        this.load.images([ 'bg', 'monster', 'turret', 'bullet' ]);

        this.load.spritesheet('wobble', 'wobble.png', 60, 20);
        this.load.spritesheet('button', 'button.png', 120, 40);
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
    
    this.score = 0;
    this.scoreText = null;
    
    this.lives = 10;
    this.livesText = null;    
    
    this.textStyle = { font: '18px Arial', fill: '#0095DD' },
    
    this.monsters = null;
    
    this.turrets = null;
    
    this.bullets = null;
    
    this.pauseKey = null;
    this.debugKey = null;
    this.showDebug = true;
};

CravenDefense.Game.prototype = {
    
    init: function () {
        
        this.monsterSpeed = 250;
        
    },
    
    preload: function () {
        this.load.path = 'assets/';
    },  
      
    create: function () {
        
        /******* Monsters *********/
        this.monsters = this.add.group();
        // this.createMonsters();
        
        this.releaseMonster();

        /******* Turrets *********/
        this.turrets = this.add.group();
        
        var turret = this.add.sprite(this.world.width/2, this.world.height/2, 'turret');
        turret.anchor.set(0.5,0.5);
        this.physics.enable(turret, Phaser.Physics.ARCADE);
        turret.body.immovable = true;       
        
        this.turrets.add(turret); 
        
        /******* Bullets *********/
        this.bullets = this.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

        this.bullets.createMultiple(50, 'bullet');
        this.bullets.setAll('checkWorldBounds', true);
        this.bullets.setAll('outOfBoundsKill', true);
        
        /******* HUD *********/
        this.scoreText = this.add.text(5, 5, 'Score: ' + this.score, this.textStyle);
        this.livesText = this.add.text(5, 25, 'Lives: '+ this.lives, this.textStyle);
        this.livesText.anchor.set(0,0);        
        
        //  Press P to pause and resume the game
        this.pauseKey = this.input.keyboard.addKey(Phaser.Keyboard.P);
        this.pauseKey.onDown.add(this.togglePause, this);

        //  Press D to toggle the debug display
        this.debugKey = this.input.keyboard.addKey(Phaser.Keyboard.D);
        this.debugKey.onDown.add(this.toggleDebug, this);

    },
    
    update: function () {
        
        this.turrets.forEachAlive(this.findTarget, this);      
        
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
    
    renderBody: function (sprite) {

        this.game.debug.body(sprite);

    },
    
    togglePause: function () {

        this.game.paused = (this.game.paused) ? false : true;

    },

    toggleDebug: function () {

        this.showDebug = (this.showDebug) ? false : true;

    },    
    
    clickedIt : function(event) {
        console.log("clicked it");
    },
    
    createMonster : function () {
        var monster = this.add.sprite(0, game.world.height/3, 'monster');
        
        this.physics.enable(monster, Phaser.Physics.ARCADE);
        monster.body.immovable = true;
        monster.anchor.set(0.5);
        monster.body.velocity.set(this.monsterSpeed, 0);
        monster.checkWorldBounds = true;
        monster.events.onOutOfBounds.add(this.monsterLeaveScreen, this);  
            
        return monster;
    },
    releaseMonster : function() {
        var monster = this.monsters.getFirstDead();   
        
        if(monster) {
            // reset health etc
            
        } else {
            monster = this.createMonster();
            this.monsters.add(monster);
        }
    },
    
    monsterLeaveScreen : function (monster) {
        monster.kill();
        
        this.lives--;
        
        if(this.lives) {
            this.livesText.setText('Lives: ' + this.lives);
        }
        else {
            alert('You lost, game over!');
            location.reload();
        }
    },
    
    findTarget : function (turret) {
        var monsterCount = this.monsters.countLiving();

        for(var i = 0; i < monsterCount; i++) {
            var m = this.monsters.children[i];
            if(this.physics.arcade.distanceBetween(turret, m) < 100) {
                this.fireTurret(turret, m);
                return; 
            }            
        }
    },
    
    fireTurret : function (turret, monster) {
        
        var bullet = this.bullets.getFirstDead();

        bullet.reset(turret.x-20, turret.y-20);

        this.physics.arcade.moveToObject(bullet, monster, 400);

    },
    
    gameOver : function () {
        if (this.monsters.countLiving() === 0) {
            alert('You won the game, congratulations!');
            location.reload();
        }
    }
    
};

var game = new Phaser.Game(800, 595, Phaser.AUTO, 'game');

game.state.add('CravenDefense.Preloader', CravenDefense.Preloader);
game.state.add('CravenDefense.Game', CravenDefense.Game);

game.state.start('CravenDefense.Preloader');