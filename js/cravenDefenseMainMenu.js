CravenDefense.MainMenu = function(game) {
    this.titleScreen = null;
    
};

CravenDefense.MainMenu.prototype = {
    init: function(data) {
        this.players = data.players;
        this.turrets = data.turrets;
        this.monsters = data.monsters
        this.stages = data.stages;
        
        this.textStyle = { font: "18px Arial", fill: "#0095DD" };
        
    },
    
    create: function(game) {
        var player = this.players[0];
        
        var welcomeText = this.add.text(this.world.centerX, this.world.centerY - 50, "Welcome: " + player.name, this.textStyle);
        welcomeText.anchor.set(0.5,0.5);
        
        var startButton = this.add.button(this.world.centerX, this.world.centerY, "button", this.start, this, 1, 0, 2);
        startButton.anchor.set(0.5);
        
        this.input.onDown.addOnce(this.start, this);        
        
    },
    
    update: function() {
        
    },
    
    start: function () {
        this.state.start("CravenDefense.Game", true, false, { players: this.players, 
                                                              turrets: this.turrets, 
                                                              monsters: this.monsters,
                                                              stages: this.stages
                                                            });
                                                            
    }
    
};