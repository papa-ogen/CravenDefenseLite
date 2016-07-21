var Bullet = function (game, key) {
    
    Phaser.Sprite.call(this, game, 0, 0, key);
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
    this.tracking = true;
    this.scaleSpeed = 0;
    
};

Bullet.prototype = Object.create(Phaser.Sprite.prototype);

Bullet.prototype.constructor = Bullet;

Bullet.prototype.fire = function (x, y, angle, speed, target) {
    
    this.reset(x, y);
    this.scale.set(1);
    this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);
    this.angle = angle;
    this.game.physics.arcade.moveToObject(this, target, speed);
    
};
Bullet.prototype.update = function () {
    
    if (this.tracking)
    {
        this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
    }
    
    if (this.scaleSpeed > 0)
    {
        this.scale.x += this.scaleSpeed;
        this.scale.y += this.scaleSpeed;
    }
    
};
    
var Weapon = {};
    

/******* Single Bullet *********/
Weapon.SingleBullet = function (game) {
    
    Phaser.Group.call(this, game, game.world, 'SingleBullet', false, true, Phaser.Physics.ARCADE);
    
    this.nextFire = 0;
    this.bulletSpeed = 600;
    this.fireRate = 1000;
    this.range = 200;
    this.dmg = 5;
    
    for (var i = 0; i < 64; i++)
    {
        this.add(new Bullet(game, 'bullet5'), true);
    }
    
    return this;
    
};

Weapon.SingleBullet.prototype = Object.create(Phaser.Group.prototype);
Weapon.SingleBullet.prototype.constructor = Weapon.SingleBullet;
Weapon.SingleBullet.prototype.fire = function (source, target) {
    
    if (this.game.time.time < this.nextFire) { return; }
    
    var x = source.x + 10;
    var y = source.y + 10;
    
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, target);
    this.nextFire = this.game.time.time + this.fireRate;
    
};


/******* Scatter Shot *********/
Weapon.ScatterShot = function (game) {
    
    Phaser.Group.call(this, game, game.world, 'ScatterShot', false, true, Phaser.Physics.ARCADE);
    
    this.nextFire = 0;
    this.bulletSpeed = 600;
    this.fireRate = 2000;
    this.range = 100;
    this.dmg = 10;
    
    for (var i = 0; i < 100; i++)
    {
        this.add(new Bullet(game, 'bullet5'), true);
    }
    
    return this;
    
};
Weapon.ScatterShot.prototype = Object.create(Phaser.Group.prototype);
Weapon.ScatterShot.prototype.constructor = Weapon.ScatterShot;
Weapon.ScatterShot.prototype.fire = function (source, target) {
    
    if (this.game.time.time < this.nextFire) { return; }
    
    var x = source.x + 16;
    var y = (source.y + source.height / 2) + this.game.rnd.between(-10, 10);
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, target);
    
    this.nextFire = this.game.time.time + this.fireRate;
    
};


/******* Beam *********/
Weapon.Beam = function (game) {
    Phaser.Group.call(this, game, game.world, 'Beam', false, true, Phaser.Physics.ARCADE);
    
    this.nextFire = 0;
    this.bulletSpeed = 1000;
    this.fireRate = 500;
    this.range = 100;
    this.dmg = 10;
    
    for (var i = 0; i < 64; i++)
    {
        this.add(new Bullet(game, 'bullet11'), true);
    }
    
    return this;
    
};

Weapon.Beam.prototype = Object.create(Phaser.Group.prototype);
Weapon.Beam.prototype.constructor = Weapon.Beam;
Weapon.Beam.prototype.fire = function (source, target) {
    
    if (this.game.time.time < this.nextFire) { return; }
    
    var x = source.x + 40;
    var y = source.y + 10;
    
    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, target);
    this.nextFire = this.game.time.time + this.fireRate;
    
};