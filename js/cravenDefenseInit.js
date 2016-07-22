var game = new Phaser.Game(800, 595, Phaser.AUTO, "game");

game.state.add("CravenDefense.Preloader", CravenDefense.Preloader);
game.state.add("CravenDefense.MainMenu", CravenDefense.MainMenu);
game.state.add("CravenDefense.Game", CravenDefense.Game);

game.state.start("CravenDefense.Preloader");