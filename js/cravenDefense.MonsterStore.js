YUI.add('MonsterStore', function (Y) {
	Y.namespace('CravenDefense.MonsterStore');
	
	var monster = function(data) {
		this.id = data.id;
		this.type = data.type;
		this.cost = data.cost;
		this.lives = data.lives;
		this.damage = data.damage;
		this.speed = data.speed;
	}
	var monsters = [];
	
	monsterType1 = {
		id: 'm1',
		type: 'Goblin',
		cost: 10,
		lives: 400,
		damage: 1,
		speed: 5
	  };  
	  monsterType2 = {
		id: 'm2',
		type: 'Orc',
		cost: 15,
		lives: 250,
		damage: 2,
		speed: 15
	  };  
	  monsterType3 = {
		id: 'm3',
		type: 'Troll',
		cost: 20,
		lives: 1000,
		damage: 5,
		speed: 20
	}; 
	
	Y.CravenDefense.MonsterStore = {
		init: function () {
			this.setMonster(monsterType1);			
			this.setMonster(monsterType2);			
			this.setMonster(monsterType3);
		},
		getMonsterTypes: function () {
			return monsters;
		},
		setMonster: function (data) {
			monsters.push(new monster(data));
		}	
   };
}, '1');