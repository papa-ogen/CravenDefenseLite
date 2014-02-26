YUI.GlobalConfig = {
    modules: {
        Map: 'js/cravenDefense.Map.js',
        TurretStore: 'js/cravenDefense.TurretStore.js',
        User: 'js/cravenDefense.User.js',
        MonsterStore: 'js/cravenDefense.MonsterStore.js',
        Monster: 'js/cravenDefense.Monster.js'
    }
};

YUI().use('Map', 'TurretStore', 'User', 'MonsterStore', 'Monster', 'cssbutton', function (Y) {   
	var monsters = Y.one('.monster');
	
	Y.namespace('CravenDefense');
	
	var Map = Y.CravenDefense.Map;
		Map.init();	

	var tStore = Y.CravenDefense.TurretStore;	

	var u = Y.CravenDefense.User;
		u.init(tStore);	
	
	var mS = Y.CravenDefense.MonsterStore;
		mS.init();	
	var monsterTypes = mS.getMonsterTypes();

	var m = Y.CravenDefense.Monster;
		m.init(monsterTypes, u);
	var monsters = m.getMonsters();	
	
	function startWave() {
		var timer = 100;
		monsters.each(function(monster, k) {
			setTimeout(function() {
				m.animateMonster(monster, Map.getPath(), monsterTypes, u);
			}, timer);
			timer += 500;
		});
	}  		
	
	// put animate monster outside so I can get() current turret active, set() user money etc

	Y.one('#start-wave').on('click', function(){
		resetToAnimStart();
		startWave();
	});
	
	var resetToAnimStart = function(){
		monsters.setStyles({'left': 0, 'top': 234}); // Where x, y is the animation starting point  
	}
});