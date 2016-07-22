CravenDefense.Maps = function (game) {
    // Map
    console.log(this.game.width);
    this.game = game;
    this.bmd =  this.game.add.bitmapData(this.game.width, this.game.height);
    this.bmd.addToWorld();
    this.points = {
        "x": [ 0, 32, 128, 256, 384, 512, 608, 800, 850 ],
        "y": [ 200, 240, 240, 240, 240, 240, 240, 240, 240 ]
    };
    this.path = [];
};

CravenDefense.Maps.prototype = {
    init: function () {
      this.plot();  
    },
    plot: function () {

        this.bmd.clear();

        var x = 1 / this.game.width,
            ix = 0;

        for (var i = 0; i <= 1; i += x)
        {
            var px = this.game.math.catmullRomInterpolation(this.points.x, i);
            var py = this.game.math.catmullRomInterpolation(this.points.y, i);

            var node = { x: px, y: py, angle: 0 };

            if (ix > 0)
            {
                node.angle = this.game.math.angleBetweenPoints(this.path[ix - 1], node);
            }

            this.path.push(node);
            
            ix++;
            
            this.bmd.rect(px, py, 1, 1, "rgba(255, 255, 255, 1)");
        }

        for (var p = 0; p < this.points.x.length; p++)
        {
            this.bmd.rect(this.points.x[p]-3, this.points.y[p]-3, 6, 6, "rgba(255, 0, 0, 1)");
        }

    }
};
