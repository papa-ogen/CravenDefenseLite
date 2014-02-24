YUI.add('TurretStore', function (Y) {
	Y.namespace('CravenDefense.TurretStore');

	var cdStore = Y.one('.cd-turret-store');
	var cdTurrets = [];
	
	cdTurret1 = {
		id: 'cd-turret-1',
		type: "Machine Gun Tower",
		cost: 50,
		range: 100,
		damage: 8,
		speed: 5
	};
	
	Y.CravenDefense.TurretStore = {
		init: function () {
			cdTurrets.push(new this.turret(cdTurret1));
			
			this.createStore(); // Populate store with elements
		  	
		  	cdStore.delegate('hover', this.over, this.out, '.cd-turret'); // hover information			
		},
		getTurrets: function () {
			return cdTurrets;
		},
    	over: function () {    
			this.one('.cd-turret-info').transition({
				duration: 1, // seconds
				opacity : 1
			});
    	},
  		out: function () {
		  this.one('.cd-turret-info').transition({
				duration: 1, // seconds
				opacity : 0
			});
    	},
		turretInfo: function (t, data) {
			var tNode = Y.Node.create('<div class="cd-turret-info"><ul><li>Name: <span>' + data.type + '</span></li><li>Cost: <span>' + data.cost + '</span></li><li>Range: <span>' + data.range + '</span></li><li>Damage: <span>' + data.damage + '</span></li>    <li>Speed: <span>' + data.speed + '</span></li></ul></div>');  	
			var tLabel = Y.Node.create('<div class="turret-label">' + data.type + '</div>')
			tNode.appendChild(tLabel);   
			t.appendChild(tNode);   			
		},
    	createStore: function() {
    		var tId = 1;
    		for(var i=0; i < cdTurrets.length; i++) {
				var tNode = Y.Node.create('<div id="cd-turret-' + tId +'" class="cd-turret cd-turret__level-1"></div>');  	
				cdStore.appendChild(tNode);   		
			
				this.turretInfo(tNode, cdTurrets[i]);
					
				tId += 1;
			}	
   		},
		turret: function (data, node) {
			this.id = data.id;
			this.type = data.type;
			this.cost = data.cost;
			this.range = data.range;
			this.damage = data.damage;
			this.speed = data.speed;
			this.node = node;
		}   		
   };
}, '0.0.1', {
    requires: ['node', 'anim', 'event-hover', 'transition']
});