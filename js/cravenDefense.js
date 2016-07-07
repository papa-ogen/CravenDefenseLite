"use strict";
/*** TEMP VARS ***/
var AMOUNT_OF_MONSTERS = 3;

var game = new Phaser.Game(480, 320, Phaser.AUTO, null, {preload: preload, create: create, update: update, render: render});

var 
    monsters,
    monster,
    turret,
    // Player
    scoreText,
    score = 0,
    lives = 3,
    livesText,
    lifeLostText,
    // Hud
    textStyle = { font: '18px Arial', fill: '#0095DD' },
    playing = false,
    startButton;
    
    var bullets;
    var fireRate = 100;
    var nextFire = 0;
    
    // https://github.com/photonstorm/phaser-coding-tips/blob/master/issue-008/aliens.html
    var points = {
            'x': [ 32, 128, 256, 384, 512, 608 ],
            'y': [ 240, 240, 240, 240, 240, 240 ]
        };
    var pi = 0;
    var path = [];

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = '#eee';
    game.load.image('monster', 'img/ball.png');
    game.load.image('turret', 'img/brick.png');
    game.load.image('bullet', 'img/ball.png');
        
    game.load.spritesheet('monster', 'img/wobble.png', 20, 20);
    game.load.spritesheet('button', 'img/button.png', 120, 40);
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.checkCollision.right = false;
    game.physics.arcade.checkCollision.down = false;
    game.physics.arcade.checkCollision.up = false;
    
    /******* Monsters *********/
    createMonsters();
    
    /******* Turrets *********/
    turret = game.add.sprite(game.world.width/2, game.world.height/2, 'turret');
    turret.anchor.set(0.5,0.5);
    game.physics.enable(turret, Phaser.Physics.ARCADE);
    turret.body.immovable = true;
    
    /******* Bullets *********/
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    bullets.createMultiple(50, 'bullet');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);
    
     /******* HUD *********/
    scoreText = game.add.text(5, 5, 'Points: 0', textStyle);
    livesText = game.add.text(game.world.width-5, 5, 'Lives: '+lives, textStyle);
    livesText.anchor.set(1,0);
    
    startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', startGame, this, 1, 0, 2);
    startButton.anchor.set(0.5);
    
    plot();
}

function update() {
    monsters.children[0].x = path[pi].x;
    monsters.children[0].y = path[pi].y;
    pi++;
    
    if (pi >= path.length)
    {
        pi = 0;
    }
    
    game.physics.arcade.collide(bullets, monsters, turretHitMonster);
    
    monsters.forEach(function(monster) {
        if(game.physics.arcade.distanceBetween(turret, monster) < 100 && monster.alive) {
            fire(monster);
        }
    });    
}

function render() {
    game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.total, 32, 32);
    game.debug.text('Monsters: ' + monsters.length + ' / Turrets ', 32, 52);
    game.debug.spriteInfo(turret, 32, 450);
}

function createMonsters() {
    monsters = game.add.group();
    
    for(var i=0; i<AMOUNT_OF_MONSTERS; i++) {
        var x = 0 + i;
        monster = game.add.sprite(x*20, game.world.height/3, 'monster');
        monster.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
        // monster.animations.play("wobble");
        game.physics.enable(monster, Phaser.Physics.ARCADE);
        monster.body.immovable = true;
        monster.anchor.set(0.5);
        monster.body.velocity.set(0, 0);
        monster.checkWorldBounds = true;
        monster.events.onOutOfBounds.add(monsterLeaveScreen, this);  
            
        monsters.add(monster);
    }
}

function turretHitMonster(bullet, monster) {
    var killTween = game.add.tween(monster.scale);
    
    // set 1px away from turret
    monster.body.velocity.set(0, 0);
    
    killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
    killTween.onComplete.addOnce(function(){
        monster.kill();
    }, this);

    killTween.start();

    score += 10;
    scoreText.setText("Points: " + score);
    
    if(gameOver()) {
      alert('You won the game, congratulations!');
      location.reload();        
    }
}

function gameOver() {
    var count_alive = 0;
    for (var i = 0; i < monsters.children.length; i++) {
      if (monsters.children[i].alive == true) {
        count_alive++;
      }
    }
    if (count_alive == 0) {
      alert('You won the game, congratulations!');
      location.reload();
    }
}

function monsterLeaveScreen() {
    lives--;
    if(lives) {
        livesText.setText('Lives: '+lives);
        lifeLostText.visible = true;
    }
    else {
        alert('You lost, game over!');
        location.reload();
    }
}

function startGame() {
    startButton.destroy();
    
    monsters.forEach(function(monster) {
        monster.body.velocity.set(150, 0);
    });

    playing = true;
}

function fire(monster) {
    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstDead();

        bullet.reset(turret.x-20, turret.y-20);

        game.physics.arcade.moveToObject(bullet, monster, 400);
    }

}

function plot () {
    // this.bmd.clear();
    var mode = 1;
    path = [];
    var x = 1 / game.width;
    for (var i = 0; i <= 1; i += x)
    {
        if (mode === 0)
        {
            var px = game.math.linearInterpolation(points.x, i);
            var py = game.math.linearInterpolation(points.y, i);
        }
        else if (mode === 1)
        {
            var px = game.math.bezierInterpolation(points.x, i);
            var py = game.math.bezierInterpolation(points.y, i);
        }
        else if (mode === 2)
        {
            var px = this.math.catmullRomInterpolation(points.x, i);
            var py = this.math.catmullRomInterpolation(points.y, i);
        }
        
        path.push( { x: px, y: py });
        // this.bmd.rect(px, py, 1, 1, 'rgba(255, 255, 255, 1)');
    }
    
    // for (var p = 0; p < this.points.x.length; p++)
    // {
    //     this.bmd.rect(this.points.x[p]-3, this.points.y[p]-3, 6, 6, 'rgba(255, 0, 0, 1)');
    // }
}