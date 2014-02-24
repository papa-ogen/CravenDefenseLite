YUI.cravenDefense.Turret = function () {
	//private method:
	var turret = function(data) {
  		this.id = data.id;
		this.type = data.type;
		this.cost = data.cost;
		this.range = data.range;
		this.damage = data.damage;
		this.speed = data.speed;
	}
	var turrets = [];
	
	return  {
		init: function (Y) {
			console.log("Init turret");
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
		}		
	};
}(); 