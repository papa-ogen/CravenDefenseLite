"use strict" 

var canvas = document.getElementById('cravenDefense');
var ctx = canvas.getContext('2d');
var raf;
var now = Date.now();
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
    this.active = true,
    this.range = 20,
    this.damage = 20,
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
    this.lives = 10,
    this.active = true,
    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }
};

/******* Monsters *********/
var monsters = [], velocity, x = 5, y = 5;
for(var i=0; i<5; i++) {
    velocity = {x: 5, y: 2};
    monsters.push(new monster(x+= 0,y += 20,velocity,5));
}

/******* Turrets *********/
var turrets = [];
x = 0, y = 0;
for(var i=0; i<2; i++) {
    turrets.push(new turret(x+=50,y +=50, 5));
}

function drawMonsters() {
    var interval;
    monsters.forEach(function(monster, index) {
        interval = (index + 1) * 1000;
        console.log(now + index > Date.now());
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
      if(turret.active) {
          turret.draw();
      }
  });  
};

function drawLives() {
    ctx.font = "10px serif";
    ctx.fillStyle = "black";
    ctx.fillText("Lives: " + player.lives, 5, 15);
};

function draw() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    drawMonsters();
    drawTurrets();

    raf = requestAnimationFrame(draw);
};

canvas.addEventListener('mouseover', function(e){
    now = Date.now();
    raf = requestAnimationFrame(draw);
});

canvas.addEventListener("mouseout",function(e){
    raf = cancelAnimationFrame(raf);
});

function anyTurretsInRange(monster) {
    turrets.forEach(function(turret) {
        if(euclidDistance(monster.x, monster.y, turret.x, turret.y)) {
            
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

drawTurrets();
drawLives();


function rotateTurret(o, event) {
    var deg = getAngle(o, event);
    degreesElement.setHTML(deg);
    o.setStyle('transform', 'rotate(' + deg + 'deg)');
  }  
   function animateShot(x,tX,y,tY) {
    var myrect = mygraphic.addShape({
        type: "rect",
        width: 2,
        height: 2,
        fill: {
            color: "#0000ff"
        },
        x: tX,
        y: tY
    });  	