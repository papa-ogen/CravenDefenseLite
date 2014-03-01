YUI.add('Monster', function (Y) {	
	Y.namespace('CravenDefense.Monster');

	var monsters = Y.all('.cd-monster');
	var origin = Y.one('.cd');	
	var mDamageTxt = ["Aoch", "iih", "Doh", "POW", "Smack!"];
	
	Y.CravenDefense.Monster = {
		init: function (monsterTypes) {
			var monsters = this.getMonsters();
			var _this = this;
			
			monsters.each(function(t, y) { 
				var randType = Math.floor((Math.random()*monsterTypes.length));
				_this.monsterInfo(t, monsterTypes[randType]); 
			});		
		},
		getMonster: function (mId) {
			for(var i=0; i < monsters.length; i++) {
				if(monsters[i].id == mId) {
					return monsters[i];
				}
			}; 
		},
		setMonster: function (o, monsterTypes) {
			for(var i=0; i<monsterTypes.length; i++) {
				if(o.hasClass(monsterTypes[i].id)) {
					return monsterTypes[i];
				}
			}
		},
		getMonsters: function () {
			return monsters;
		},
		animateMonster: function (monster, arrDot, monsterTypes, user) {
			var _this = this, turret, money;
			var turrets = user.getTurrets();
			var curMonster = this.setMonster(monster, monsterTypes);
			var cashEl = Y.one('.cd-menu--money');
			var livesEl = Y.one('.cd-menu--health');
			var monsterLives = curMonster.lives;
			var oX = origin.getX(), oY = origin.getY();
			var m = new Y.Anim({
				node: monster,
				duration: curMonster.speed,
				easing: Y.Easing.easeOut,
				delay: 5
			});
						
			// Dynamically create curve
			var mPath = [];
			for(var i=0; i<arrDot.length; i++) {
				mPath.push([ (parseInt(arrDot[i][0], 10)), parseInt(arrDot[i][1], 10) ] );
			}

			m.set('to', {
				curve: mPath
			});
	  
			m.on('tween', function() {
				var oX = monster.getX(), oY = monster.getY();
				
				damage = _this.anyTurretsInRange(oX, oY, turrets);
				
				if(damage > 0) {
					monsterLives -= damage;
					monster.one('.monster-info span').setHTML(monsterLives);
				}
				
				// Kill monster
				if(monsterLives <= 0) {
					m.stop();
					money = user.getMoney() + curMonster.cost;
					user.setMoney(money);
					cashEl.setHTML(money);
					monster.hide();
					_this.textPopUp(oX, oY, "Killed");
				}	

				// Kill player
				if(oY > 800) {
					m.stop();
					lives = user.getLives() - curMonster.damage;
					user.setLives(lives);
					livesEl.setHTML(lives);
					monster.hide();
					_this.textPopUp(oX, oY - 50, "Damage");
				}				
			});   

			m.on('end', function() {
			});
		
			m.run();
			
		},
		euclidDistance: function (x1,x2,y1,y2) {
			return Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
		},
		anyTurretsInRange: function (x,y, turrets) {	
			var damage = 0, tX, tY, _this = this;	
			
			for(var i=0; i < turrets.length; i++) {
				tX = turrets[i].node.getX();
				tY = turrets[i].node.getY();
				if(this.euclidDistance(x,tX,y,tY) <= turrets[i].range && turrets[i].active) { 
					setTimeout(_this.setTurretActive, turrets[i].speed, turrets[i]);				
					
					damage += turrets[i].damage;
					turrets[i].active = false;
					
					//this.rotateTurret(turrets[i].element, x, tX, y, tY);
					this.animateShot(x,tX,y,tY);
				}
			}
			return damage;
		},
		setTurretActive: function (t) {
			t.active = true;
		},
  		monsterInfo: function (t, data) {
		  	var tNode = Y.Node.create('<div class="monster-info"><span>' + data.lives + '</span></div>');  	
	  		t.appendChild(tNode);   
	  	},
		textPopUp: function (x, y, text) {
			var x = Math.floor(x), y = Math.floor(y);
			var xMin = x - 10, xMax = x + 10;
			var yMin = y - 10, yMax = y + 10;
			
			x = this.getRandomInt(xMin, xMax);
			y = this.getRandomInt(yMin, yMax);

			// Create node
			var popUpElement = Y.Node.create('<div class="popUp">' + text + '</div>');
			popUpElement.setX(x);
			popUpElement.setY(y);    
			origin.appendChild(popUpElement);     

			var hideAnim = new Y.Anim({
				node: popUpElement,
				to: { opacity: 0 },
				easing: 'backIn'
			});	 
    
    		this.hideElement(hideAnim, popUpElement);
  		},
		hideElement: function (anim, popUpElement) {
			var _this = this;
			setTimeout(function () {    
				anim.run();
			  	anim.on('end', _this.dropElement(popUpElement));
			}, 500);
		},
		dropElement: function (node) {
			var origin = Y.one('.cd');

			origin.removeChild(node); // node is an instance of Node
		},
		getRandomInt: function (min, max) {
	    	return Math.floor(Math.random() * (max - min + 1) + min);
		},		
		getAngle: function (x, tX, y, tY) {
			var dx, dy;

			dx = x - tX;
			dy = y - tY;

			d =  Math.atan2(dy, dx) / Math.PI * 180 + 79;

			return Math.round(d); 
		},
		rotateTurret: function rotateTurret(turret, x, tX, y, tY) {
			var deg = this.getAngle(x, tX, y, tY);
			turret.setStyle('transform', 'rotate(' + deg + 'deg)');
		},
		animateShot: function (x,tX,y,tY) {
			var mygraphic = new Y.Graphic({render:".cd"});
			var myrect = mygraphic.addShape({
				type: "rect",
				width: 1,
				height: 5,
				fill: {
					color: "#0000ff"
				},
				x: tX,
				y: tY
			});  	

			//this.angleShot(myrect, x, tX, y, tY);

			var myAnim = new Y.Anim({
				node: myrect,
				duration: 0.5, 
				to: {
					x: x,
					y: y
				}
			});

			myAnim.run();
			myAnim.on('end', function() {
				mygraphic.removeShape(myrect);
			});	
		},
		angleShot: function (myrect, x, tX, y, tY) {
			dx = tX - x;
			dy = y - tY;	

			deg = Math.atan2(dy, dx) * (180/Math.PI) + 78; 

			myrect.set("transform", "rotate(" + Math.round(deg) + ")");
		}	
   };
}, '0.0.1', {
    requires: ['node', 'anim']
});