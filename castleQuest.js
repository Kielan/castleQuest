var Game = {
    display: null,
    map: {},
    engine: null,
    player: null,
    pedro: null,
    ananas: null,

//    initUI: function () {
//      var options = {};
//    };


    init: function() {
        var options = {width: 70, height: 60, fontsize: 40};
        this.display = new ROT.Display(options);
        document.body.appendChild(this.display.getContainer());

        this._generateMap();

        var str = "Fighter\n xp\n 22/22 \n 1. \n 2. \n3. \n4. \n5."
        this.display.drawText(57,2,str);
        
        var scheduler = new ROT.Scheduler.Speed();
        scheduler.add(this.player, true);
        scheduler.add(this.pedro, true);

        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    },

    _generateMap: function() {
        var w = 55, h = 60, options = {dugPercentage : 0.6};
        var digger = new ROT.Map.Digger(w, h, options);
        var layer1 = [];
        
        var digCallback = function(x, y, value) {
            if (value) { return; }
            
            var key = x+","+y;
            this.map[key] = ".";
            layer1.push(key);
        };

        digger.create(digCallback.bind(this));
        
        this._drawWholeMap();
        
        this.player = this._createBeing(Player, layer1);
//        this.pedro = this._createBeing(Pedro, layer1);
    },


    _createBeing: function(being, layer1) {
        var index = Math.floor(ROT.RNG.getUniform() * layer1.length);
        var key = layer1.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        return new being(x, y);
    },
    

    _drawWholeMap: function() {
        for (var key in this.map) {
            var parts = key.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            this.display.draw(x, y, this.map[key]);
        }
    }
};


var Player = function(x, y) {
    this._x = x;
    this._y = y;
    this.speed= 1;
    this._draw();
}

Player.prototype = {
  getSpeed : function() { return 100; },
  getX : function() {return this._x; },
  getY : function() {return this._y; },
  act : function() {
    Game.engine.lock();
    window.addEventListener("keydown", this);
  },
  handleEvent : function (e) {
    var code = e.keyCode;
    if (code == 13 || code == 32) {
        this._checkBox();
        return;
    }

    var keyMap = {};
    keyMap[38] = 0;
    keyMap[33] = 1;
    keyMap[39] = 2;
    keyMap[34] = 3;
    keyMap[40] = 4;
    keyMap[35] = 5;
    keyMap[37] = 6;
    keyMap[36] = 7;

    /* one of numpad directions? */
    if (!(code in keyMap)) { return; }

    /* is there a free space? */
    var dir = ROT.DIRS[8][keyMap[code]];
    var newX = this._x + dir[0];
    var newY = this._y + dir[1];
    var newKey = newX + "," + newY;
    var keys = {};
    keys["C"] = 0;
    keys["$"] = 1;
    keys["P"] = 2;

    if (Game.map[newKey] === keys(0)) {
      console.log('alert box detected bro')
      box.bump();
      

      return;
    };
    if (Game.map[newKey] === keys(1)) {
      console.log('picked up the money dude')
      box.bump();

      return;
    };//ananas
    if (!(newKey in Game.map)) { return; }

    Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
    this._x = newX;
    this._y = newY;
    this._draw();
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
  },

  _draw : function() {
    Game.display.draw(this._x, this._y, "@", "#ff0");
  }
}


