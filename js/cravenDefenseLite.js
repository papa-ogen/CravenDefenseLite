"use strict" 

var canvas = document.getElementById('cravenDefense');
var ctx = canvas.getContext('2d');
var raf;
var player = {
    lives: 10,
    money: 100,
    score: 0
};

var turret = function(x,y,radius) {
    this.x = x,
    this.y = y,
    this.radius = radius,
    this.color = 'blue',
    this.lives = 10,
    this.engaged = false,
    this.range = 50,
    this.damage = 10,
    this.cost = 100,
    this.bulletSpeed = 2,    
    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }
};

var monster = function(x,y,velocity,radius) {
    this.x = x,
    this.y = y,
    this.vx = velocity.x,
    this.vy = velocity.y,
    this.radius = radius,
    this.color = 'red',
    this.lives = 100,
    this.cost = 10,
    this.active = true,
    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }
};

var bullet = function(x,y,target) {
    this.x = x,
    this.y = y,
    this.targetX = target.x,
    this.targetY = target.y,
    this.radius = 1,
    this.color = 'black',
    this.speed = 20,
    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }
};

/******* Monsters *********/
var monsters = [], velocity, x = 0, y = 5;
for(var i=0; i<1; i++) {
    velocity = {x: 5, y: 2};
    monsters.push(new monster(x-= 0,y += 20,velocity,5));
}

/******* Turrets *********/
var turrets = [];
x = 0, y = 0;
for(var i=0; i<2; i++) {
    turrets.push(new turret(x+=110,y +=50, 5));
}

/******* Bullets *********/
var bullets = [];

function drawMonsters() {
    var interval;
    monsters.forEach(function(monster, index) {
        if(monster.active) {
            monster.draw();
            
            if(outOfBounds(monster)) {
                monster.active = false;
                player.lives -= 1;
                drawLives();
                
                if(player.lives <= 0) {
                    alert("GAME OVER");
                    document.location.reload();
                }
            }

            monster.x += monster.vx;        
        }
        
        drawLives();
    });
};

function drawTurrets() {
  turrets.forEach(function(turret, index) {
        turret.draw();
        anyMonstersInRange(turret);
  });  
};

function drawBullets() {
      bullets.forEach(function(bullet, index) {
          animateShot(bullet);
  }); 
};

function drawLives() {
    ctx.font = "10px serif";
    ctx.fillStyle = "black";
    ctx.fillText("Lives: " + player.lives + ", Money: " + player.money, 5, 15);
};

function draw() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    drawMonsters();
    drawTurrets();
    drawBullets();
    
    raf = requestAnimationFrame(draw);
};

canvas.addEventListener('mouseover', function(e){
    raf = requestAnimationFrame(draw);
});

canvas.addEventListener("mouseout",function(e){
    raf = cancelAnimationFrame(raf);
});

function anyMonstersInRange(turret) {
    monsters.forEach(function(monster) {
        if(monster.active && euclidDistance(monster.x, monster.y, turret.x, turret.y) < turret.range) {
            fireTurret(turret, monster);
            turret.engaged = true;
            return;
        }
    });
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
    
    bullets.push(new bullet(turret.x, turret.y, {x: monster.x, y: monster.y}));

    if(monster.lives <= 0) {
        player.money += monster.cost;
        monster.active = false;
    }
};

function animateShot(bullet) {
    var tx = bullet.targetX - bullet.x,
        ty = bullet.targetY - bullet.y,
        dist = Math.sqrt(tx*tx+ty*ty),
        rad = Math.atan2(ty,tx),
        angle = rad/Math.PI * 180;
    
        var velX = (tx/dist)*bullet.speed;
        var velY = (ty/dist)*bullet.speed;
    
    if(dist > 1) {
        bullet.x += velX;
        bullet.y += velY;
    }
    
    bullet.draw();
};  

function collision(circle1, circle2) {
    var dx = circle1.x - circle2.x;
    var dy = circle1.y - circle2.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < circle1.radius + circle2.radius) {
        // collision detected!
    }
};

function removeMonster(array, monsterIndex) {
    var index = array.indexOf(monsterIndex);
    
    if (index > -1) {
        return array.splice(index, 1);
    }
    
    return array;
};

drawMonsters();
drawTurrets();
drawLives();


function rotateTurret(o, event) {
    var deg = getAngle(o, event);
    degreesElement.setHTML(deg);
    o.setStyle('transform', 'rotate(' + deg + 'deg)');
};  

function getAngle(o, event) {
    var dx, dy, tX = o.getX(), tY = o.getY(), mX = event.clientX, mY = event.clientY;

    dx = mX - tX;
    dy = mY - tY;

    d =  Math.atan2(dy, dx) / Math.PI * 180 + 79;

    return Math.round(d); 
};