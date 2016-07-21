var Turret = function (game, key) {
    
    Phaser.Sprite.call(this, game, 0, 0, key);
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
    this.tracking = true;
    this.scaleSpeed = 0;
    
};

Turret.prototype = Object.create(Phaser.Sprite.prototype);

Turret.prototype.constructor = Turret;

var Store = {};

Store.Turrets = function (game) {
    
    Phaser.Group.call(this, game, game.world, 'Turrets', false, true, Phaser.Physics.ARCADE);
    
    this.nextFire = 0;
    this.bulletSpeed = 600;
    this.fireRate = 1000;
    this.range = 200;
    this.dmg = 5;
    
    for (var i = 0; i < 64; i++)
    {
        this.add(new Turret(game, 'turret1'), true);
    }
    
    return this;
    
};