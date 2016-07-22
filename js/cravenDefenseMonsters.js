var Monster = function (game, monster) {
    
    Phaser.Sprite.call(this, game, 0, 0, monster.type);

    // this.body.immovable = true;
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.pi = monster.pi;
    this.health = monster.health;
    this.maxHealth = monster.health;
    this.speed = monster.speed;                
    this.alive = false;
    this.visible = false;    
    
};

Monster.prototype = Object.create(Phaser.Sprite.prototype);
Monster.prototype.constructor = Monster;

Store.Monsters = function (game, monsters) {
    
    Phaser.Group.call(this, game, game.world, 'Monsters', false, true, Phaser.Physics.ARCADE);
    
    this.enableBody = true;
    this.physicsBodyType = Phaser.Physics.ARCADE;
    this.setAll("anchor.x", 0.5);
    this.setAll("anchor.y", 0.5);

    for (var i = 0; i < monsters.length; i++)
    {
        var monster = monsters[i];
        this.add(new Monster(game, monster), true);
    }
    
    return this;
    
};

Store.Monsters.prototype = Object.create(Phaser.Group.prototype);
Store.Monsters.prototype.constructor = Store.Monsters;