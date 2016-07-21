var Turret = function (game, turret) {

    Phaser.Sprite.call(this, game, 0, 0, turret.type);
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;
    this.tracking = true;
    this.scaleSpeed = 0;
    this.cost = turret.cost;
    this.name = turret.name;
    this.weapon = turret.weapon;
};

Turret.prototype = Object.create(Phaser.Sprite.prototype);

Turret.prototype.constructor = Turret;

var Store = {};

Store.Turrets = function (game, turrets) {
    
    Phaser.Group.call(this, game, game.world, 'Turrets', false, true, Phaser.Physics.ARCADE);
    
    this.enableBody = true;
    this.inputEnableChildren = true;
    this.physicsBodyType = Phaser.Physics.ARCADE;
    // this.onChildInputDown
    // onChildInputOut
    // onChildInputOver
    // onChildInputUp

    for (var i = 0; i < turrets.length; i++)
    {
        var turret = turrets[i];
        this.add(new Turret(game, turret), true);
    }
    
    return this;
    
};

Store.Turrets.prototype = Object.create(Phaser.Group.prototype);
Store.Turrets.prototype.constructor = Store.Turrets;