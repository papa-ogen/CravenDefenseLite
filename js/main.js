// Constructor
YUI().use('anim', 'dd-drag', 'dd-delegate', 'graphics', 'cssbutton', 'event-hover', 'transition', 'get',  function (Y) {   
	YUI.namespace("cravenDefense");
	
	// Load resources
	var resources = ['js/cravenDefense.Monster.js', 'js/cravenDefense.MonsterStore.js', 
					 'js/cravenDefense.TurretStore.js',
					 'js/cravenDefense.Map.js', 'js/cravenDefense.User.js'];
	Y.Get.js(resources, function (err) {
    	if (err) {
        	Y.Array.each(err, function (error) {
        	    Y.log('Error loading JS: ' + error.error, 'error');
        	});
        	return;
    	}

		Y.log('files loaded successfully!');

		var cdContainer = new Y.Graphic({render:"#cdContainer"});
	
		var map = YUI.cravenDefense.Map;
			map.init(Y, cdContainer);	
	
		var tStore = YUI.cravenDefense.TurretStore;	

		var u = YUI.cravenDefense.User;
			u.init(Y, tStore);	
		
		var mS = YUI.cravenDefense.MonsterStore;
			mS.init();	
		var monsterTypes = mS.getMonsterTypes();
	
		var m = YUI.cravenDefense.Monster;
			m.init(Y, monsterTypes, u);
		var monsters = m.getMonsters(Y);	
		
		function startWave() {
			var timer = 100;
			monsters.each(function(monster, k) {
				setTimeout(function() {
					m.animateMonster(Y, monster, map.getPath(Y), monsterTypes, u.getTurrets());
				}, timer);
				timer += 500;
			});
		}  		

		Y.one('#btn-animate').on('click', function(){
			startWave();
		});
	
	});
});