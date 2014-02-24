YUI.add('User', function (Y) {
	Y.namespace('CravenDefense.User');
	
	var lives = 20, money = 500, xp = 0, wave = 1, turrets = [];
	var origin = Y.one('.cd');
	var livesEl = Y.one('.cd-menu--health');
		livesEl.setHTML(lives);
	var cashEl = Y.one('.cd-menu--money');
		cashEl.setHTML(money);
	var waveEl = Y.one('.cd-menu--waves');
		waveEl.setHTML(wave);
	var cdStore = Y.one('.cd-turre-tstore');
	var cdTurret = Y.all('.cd-turret');
						
	var turret = function(data) {
  		this.id = data.id;
		this.type = data.type;
		this.cost = data.cost;
		this.range = data.range;
		this.damage = data.damage;
		this.speed = data.speed;
		this.element = data.element;
	}
	
	var canAfford = function(cost) {
		if(cost > money) return false;
		return true;
	}	
	
	Y.CravenDefense.User = {
		init: function (tStore) {
			tStore.init();
				
			var cdTurrets = tStore.getTurrets();
			var $this = this;
			
			var dd = new Y.DD.Delegate({
			    container: '.cd-turret-store', //The common container
		    	nodes: '.cd-turret' //The items to make draggable
			}); 
			 		  	
			dd.on('drag:drag', function(e) {
			  	var _this = dd.get('currentNode');
		  		_this.addClass('rangeDrag');
			});		
		   
			dd.on('drag:end', function(e) {
				var _this = dd.get('currentNode');
	
				e.preventDefault();    
				_this.removeClass('rangeDrag');
				var turretType = _this.get('id'), selectedTurret;
	
				// Get Selected Turret info
				for(var i=0; i<cdTurrets.length; i++) {
					if(cdTurrets[i].id == turretType) {
						selectedTurret = cdTurrets[i]; 
					}
				}
				
				if(selectedTurret.cost < money) {
					var x = e.pageX, y = e.pageY, boughtTurrets, tId;
					boughtTurrets = Y.all('.turret')._nodes.length;
					tId = "t" + boughtTurrets;

					// Create node
					var node = _this.cloneNode(true);
					origin.appendChild(node);
					
					node.setX(x);
					node.setY(y); 					
   
					 // Update cash flow
					 money -= selectedTurret.cost;
					 cashEl.setHTML(money);
					 
					 // Add turret to user's turrets
					 turrets.push(new tStore.turret(selectedTurret, node));
				} else {
					statusBar.setHTML("Can't afford turret");
				}									
			});			
		},
		getTurret: function (tId) {
			for(var i=0; i < turrets.length; i++) {
				if(turrets[i].id == tId) {
					return turrets[i];
				}
			}; 
		},
		setTurret: function (data) {
			turrets.push(new turret(data));
		},
		getTurrets: function () {
			return turrets;
		},
		getMoney: function () {
			return money;
		},	
		setMoney: function (val) {
			money = val;
		}		
   };
}, '0.0.1', {
    requires: ['node', 'dd']
});