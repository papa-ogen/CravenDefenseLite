var CravenDefense = {};

CravenDefense.Preloader = function() {};

CravenDefense.Preloader.prototype = {
    init: function () {
        
        this.input.maxPointers = 1;
        this.scale.pageAlignHorizontally = true;
        
        this.textStyle = { font: "18px Arial", fill: "#0095DD" };
        
    },

    preload: function () {
        
        this.load.path = "assets/data/";
        
        this.load.json("players", "players.json");
        this.load.json("monsters", "monsters.json");
        this.load.json("turrets", "turrets.json");
        this.load.json("stages", "stages.json");
        
        this.load.path = "assets/images/";
        
        this.load.images([ "background", 
                           "monster1", "monster2", "monster3", "monster4",
                           "turret1", "turret2", "turret3", 
                           "bullet1", "bullet2", "bullet3", "bullet4", "bullet5", 
                           "bullet6", "bullet7", "bullet8", "bullet9", "bullet10", "bullet11" ]);

        this.load.spritesheet("wobble", "wobble.png", 60, 20);
        this.load.spritesheet("button", "button.png", 120, 40);
        this.load.spritesheet("kaboom", "explode.png", 128, 128);
        this.load.spritesheet("laser", "rgblaser.png", 4, 4);

    },

    create: function () {
        
        this.players = this.cache.getJSON("players");
        this.turrets = this.cache.getJSON("turrets");
        this.monsters = this.cache.getJSON("monsters");
        this.stages = this.cache.getJSON("stages");
        
        var player = this.players[0];
        
        var welcomeText = this.add.text(this.world.centerX, this.world.centerY - 50, "Welcome: " + player.name, this.textStyle);
        welcomeText.anchor.set(0.5,0.5);
        
        var startButton = this.add.button(this.world.centerX, this.world.centerY, "button", this.start, this, 1, 0, 2);
        startButton.anchor.set(0.5);
        
        this.input.onDown.addOnce(this.start, this);
        
    },
    start: function () {
        
        this.state.start("CravenDefense.Game", true, false, { players: this.players, 
                                                              turrets: this.turrets, 
                                                              monsters: this.monsters,
                                                              stages: this.stages
                                                            });
                                                            
    }
};
