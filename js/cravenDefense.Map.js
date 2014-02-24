YUI.add('Map', function (Y) {
	Y.namespace('CravenDefense.Map');
	
	var cdContainer = new Y.Graphic({render:".cd"});
	var animPath = cdContainer.addShape({
		type: "path",
		stroke: {
			weight: 1,
			color: "#ffad40"
		}
	});    
	var drawCurve = function(){
		animPath.moveTo(0,244);
		animPath.lineTo(432,244);
		animPath.lineTo(432,800);
		animPath.end();
    }	
	Y.CravenDefense.Map = {
		init: function () {
			drawCurve();
		},
		getPath: function () {
			return [ 
				[0,244], [432,244], [432,800]
			];	
		}
   };
}, '1.0', {
    requires: ['graphics']
});