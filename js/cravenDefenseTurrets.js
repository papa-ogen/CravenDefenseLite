var Turret = function (game, turret) {

    Phaser.Sprite.call(this, game, 0, 0, turret.type);
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.anchor.set(0.5);
    this.cost = turret.cost;
    this.name = turret.name;
    this.weapon = turret.weapon;
    this.information = game.add.text(this.x - 50, this.y, "", { color: "#ffffff" });
    
    this.events.onInputOver.add(this.showInformation, this);
    this.events.onInputOut.add(this.hideInformation, this);    
};

Turret.prototype = Object.create(Phaser.Sprite.prototype);

Turret.prototype.constructor = Turret;
Turret.prototype.showInformation = function () {

    this.information.x = this.x - 100;
    this.information.y = this.y;
    this.information.text = this.name;
    
};
Turret.prototype.hideInformation = function () {

    this.information.text = "";

};

var Store = {};

Store.Turrets = function (game, turrets) {
    
    Phaser.Group.call(this, game, game.world, 'Turrets', false, true, Phaser.Physics.ARCADE);
    
    this.enableBody = true;
    this.inputEnableChildren = true;
    this.setAll("anchor.x", 0.5);
    this.setAll("anchor.y", 0.5);
    this.physicsBodyType = Phaser.Physics.ARCADE;
    

    for (var i = 0; i < turrets.length; i++)
    {
        var turret = turrets[i];
        this.add(new Turret(game, turret), true);
    }
    
    return this;
    
};

Store.Turrets.prototype = Object.create(Phaser.Group.prototype);
Store.Turrets.prototype.constructor = Store.Turrets;