"use strict"; 

/* Crossbrowser shim */
window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    function( callback ) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

/*** TEMP VARS ***/
var AmountOfMonsters = 3;
var monsterSpeed = 2;
var AmountOfTurrets = 3;

var canvas = document.getElementById('cravenDefense');
var ctx = canvas.getContext('2d');
var raf;
var player = {
    lives: 10,
    money: 100,
    score: 0
};
var monsterInterval = 0;
var currentWave = 1;
var waveCount = 10;


/***** Objects ******/
var Turret = function(x,y,radius) {
    this.x = x,
    this.y = y,
    this.radius = radius,
    this.color = 'blue',
    this.lives = 10,
    this.range = 50,
    this.damage = 10,
    this.cost = 100,
    this.shotInterval = 10,
    this.lastShot = 0
    this.barrelAngle = 45,
    this.kills = 0
};

Turret.prototype.draw = function () {
    this.body();
    this.barrel();
};

Turret.prototype.body =function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill(); 
};

Turret.prototype.barrel = function() {
    ctx.save();
    ctx.translate(this.x, this.y); // Translate to centre of square
    ctx.rotate(this.barrelAngle); // Rotate 45 degrees
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 10);
    ctx.stroke();  
    ctx.restore();
};

var monster = function(x,y,velocity,speed) {
    this.x = x,
    this.y = y,
    this.vx = velocity.x,
    this.vy = velocity.y,
    this.speed = speed,    
    this.radius = 5,
    this.color = 'red',
    this.lives = 100,
    this.cost = 10,
    this.active = true
};

monster.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
};

var bullet = function(x,y,target,monster,turret) {
    this.x = x,
    this.y = y,
    this.targetX = target.x,
    this.targetY = target.y,
    this.monster = monster,
    this.turret = turret,
    this.radius = 2,
    this.color = 'black',
    this.speed = 4
};

bullet.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
};

/******* Monsters *********/
var monsters = [], velocity, x = 0, y = 50;
for(var i=0; i<AmountOfMonsters; i++) {
    velocity = {x: 5, y: 2};
    monsters.push(new monster(x,y,velocity,monsterSpeed));
}

/******* Turrets *********/
var turrets = [];
x = 0, y = 0;
for(var i=0; i<AmountOfTurrets; i++) {
    turrets.push(new Turret(x+=75,y +=25, 5));
}

/******* Bullets *********/
var bullets = [];

/*******      *********/
/******* Init *********/
/*******      *********/
drawMonsters();
drawTurrets();
drawLives();
drawWaves();

function draw() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    
    drawMonsters();
    drawTurrets();
    drawBullets();
    drawLives();
    
    if(monsters.length === 0) {
        alert("Wave " + currentWave + " complete!");  
        
        raf = cancelAnimationFrame(raf);
        
        x = 0, y=50;
        for(var i=0; i<AmountOfMonsters; i++) {
            velocity = {x: 5, y: 2};
            monsters.push(new monster(x,y,velocity,monsterSpeed));
        }
        
        currentWave++;
        monsterInterval = 0;
        
        ctx.clearRect(0,0, canvas.width, canvas.height);
        drawTurrets();
        drawLives();
        drawWaves();
        
        return;
    } 

    raf = requestAnimationFrame(draw);
};

canvas.addEventListener('mouseover', function(e){
    raf = requestAnimationFrame(draw);
});

canvas.addEventListener("mouseout",function(e){
    raf = cancelAnimationFrame(raf);
});

function drawMonsters() {
    var interval = 0;
    monsters.forEach(function(monster, index) {
        interval = index * 60;
        if(monster.active && interval < monsterInterval) {
            monster.draw();
            
            if(outOfBounds(monster)) {
                removeObject(monsters,monster);
                player.lives -= 1;
                
                if(player.lives <= 0) {
                    alert("GAME OVER");
                    document.location.reload();
                }
            }
            
            moveMonster(monster); 
        }
    });
    monsterInterval++;
};

function moveMonster(monster) {
    monster.x += monster.speed;
    monsterLives(monster);
};

function drawTurrets() {
  turrets.forEach(function(turret, index) {
        turret.draw();
        
        if(readyToFire(turret)) anyMonstersInRange(turret);
        
        turret.lastShot++;
  });  
};

function drawBullets() {
      bullets.forEach(function(bullet, index) {
          console.log(getDistance(bullet.targetX - bullet.x, bullet.targetY - bullet.y));
          animateShot(bullet);
  }); 
};

function drawLives() {
    ctx.font = "10px serif";
    ctx.fillStyle = "black";
    ctx.fillText("Lives: " + player.lives + ", Money: " + player.money, 5, 15);
};

function drawWaves() {
    ctx.font = "10px serif";
    ctx.fillStyle = "black";
    ctx.fillText("Wave: " + currentWave, 5, 35);
};

function monsterLives(monster) {
    ctx.font = "10px serif";
    ctx.fillStyle = "black";
    ctx.fillText(monster.lives, monster.x, monster.y); 
};

function anyMonstersInRange(turret) {
    monsters.forEach(function(monster) {
        if(turretInRange(turret, monster)) {
            fireTurret(turret, monster);
            rotateTurret(turret, monster);
        }
    });
};

function turretInRange(turret, monster) {
    return euclidDistance(monster.x, monster.y, turret.x, turret.y) < turret.range;
};

function euclidDistance(x1,y1,x2,y2) {
    return Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
};

function outOfBounds(monster) {
    if(monster.x + monster.vx > canvas.width-monster.radius || monster.x + monster.vx < monster.radius) {
        return true;
    }
    if(monster.y + monster.vy > canvas.height-monster.radius || monster.y + monster.vy < monster.radius) {
        return true;
    }
    
    return false;
};

function fireTurret(turret, monster) {
    monster.lives -= turret.damage;
    bullets.push(new bullet(turret.x, turret.y, {x: monster.x, y: monster.y}, monster, turret));

    if(monster.lives <= 0) {
        player.money += monster.cost;
        turret.kills += 1;
        removeObject(monsters, monster);
    }
    
    turret.lastShot = 0;
};

function readyToFire(turret) {
    return turret.lastShot > turret.shotInterval;
};

function animateShot(bullet) {
    var tx = bullet.targetX - bullet.x,
        ty = bullet.targetY - bullet.y,
        dist = getDistance(tx, ty);
    
        var velX = (tx/dist)*bullet.speed;
        var velY = (ty/dist)*bullet.speed;
    
    if(dist > 2) {
        bullet.x += velX;
        bullet.y += velY;
    } else {
        removeObject(bullets, bullet);
        return;
    }
    
    // Direct Hit!
    if(collision(bullet, bullet.monster)) {
        removeObject(bullets, bullet);
        bullet.monster.lives -= bullet.turret.damage;
        
        if(bullet.monster.lives <= 0) {
            player.money += bullet.monster.cost;
            bullet.turret.kills += 1;
            removeObject(monsters, bullet.monster);
        }
        
        return;
    }
    
    bullet.draw();
};  

function getDistance(x, y) {
    return parseInt(Math.sqrt(x*x+y*y));
};

function collision(circle1, circle2) {
    var dx = circle1.x - circle2.x;
    var dy = circle1.y - circle2.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < circle1.radius + circle2.radius) {
        return true;
    }
    
    return false;
};

function rotateTurret(turret, monster) {
    var d, dx, dy, 
        tx = turret.x, ty = turret.y, 
        mx = monster.x, my = monster.y;
    var angle = Math.atan2(ty - my, tx - mx );
    angle = angle * (180/Math.PI);
    
    turret.barrelAngle = Math.round(angle); 
};  

function getAngle(o, event) {
    var dx, dy, tX = o.getX(), tY = o.getY(), mX = event.clientX, mY = event.clientY;

    dx = mX - tX;
    dy = mY - tY;

    d =  Math.atan2(dy, dx) / Math.PI * 180 + 79;

    return Math.round(d); 
};

function removeObject(array, obj) {
    var index = array.indexOf(obj);
    if (index > -1) {
        return array.splice(index, 1);
    }
    
    return array;
};