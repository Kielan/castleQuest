var Game = {
    display: null,
    map: {},
    engine: null,
    player: null,
    AI: null,
    gold: null,

//    initUI: function () {
//      var options = {};
//    };


    init: function() {
        var options = {width: 70, height: 50, fontsize: 40};
        this.display = new ROT.Display(options);
        document.body.appendChild(this.display.getContainer());

        this._generateMap();
        this._generateProfile();
        
        var scheduler = new ROT.Scheduler.Speed();
        scheduler.add(this.player, true);
        scheduler.add(this.AI, true);

        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    },

    _generateProfile: function() {
        var profileObject = {profession: "Fighter", xp: "xp", health: "22/22", one: "1.", two: "2.", three: "3.", four: "4.", five: "5."};
        console.log(profileObject.profession);
        console.log(profileObject.toString());
        this.display.drawText(57,2,profileObject.profession);
        this.display.drawText(57,3,profileObject.xp);
        this.display.drawText(57,4,profileObject.health);
        this.display.drawText(57,5,profileObject.one);
        this.display.drawText(57,6,profileObject.two);
        this.display.drawText(57,7,profileObject.three);
        this.display.drawText(57,8,profileObject.four);
        this.display.drawText(57,9,profileObject.five);
    },

    _generateMap: function() {
        var w = 55, h = 50, options = {dugPercentage : 0.6};
        var digger = new ROT.Map.Digger(w, h, options);
        var layer1 = [];
        
        var digCallback = function(x, y, value) {
            if (value) { return; }
            
            var key = x+","+y;
            this.map[key] = ".";
            layer1.push(key);
        };

        digger.create(digCallback.bind(this));
        
        this._generateBoxes(layer1);
        this._drawWholeMap();
        
        this.player = this._createBeing(player, layer1);
        this.AI = this._createBeing(AI, layer1);
    },


    _createBeing: function(being, layer1) {
        var index = Math.floor(ROT.RNG.getUniform() * layer1.length);
        var key = layer1.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        return new being(x, y);
    },

    _generateBoxes: function(layer1) {
        for (var i=0;i<10;i++) {
            var index = Math.floor(ROT.RNG.getUniform() * layer1.length);
            console.log('index is ' + index);
            var key = layer1.splice(index, 1)[0];
            console.log('key is ' + key);
            this.map[key] =  "C";
            if (!i) { this.gold = key; } /* first box contains an ananas */
        }
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


var player = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
    this.getSpeed = function() { return 100; };
}

player.prototype = {
//  getSpeed : function() { return 100; },
  getX : function() {return this._x; },
  getY : function() {return this._y; },
  act : function() {
    Game.engine.lock();
    window.addEventListener("keydown", this);
  },
  handleEvent : function(e) {
    var code = e.keyCode;
    if (code == 13 || code == 32) {
        this._check();
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
    keys[0] = "C";
    keys[1] = "$";
    keys[2] = "P";

    if (Game.map[newKey] === keys[0]) {
      console.log('alert box detected bro')
//      var index = null;
        newKey

//      layer1.splice(index, 1)[0];    

      return;
    };/*
    if (Game.map[newKey] === keys(1)) {
      console.log('picked up the money dude')
      box.bump();

      return;
    };//ananas */
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
  },

  _check : function() {
    var key = this._x + "," + this._y;
    if (Game.map[key] != "*") {
        alert("There is no box here!");
    } else if (key == Game.ananas) {
        alert("Hooray! You found an ananas and won this game.");
        Game.engine.lock();
        window.removeEventListener("keydown", this);
    } else {
        alert("This box is empty :-(");
    }
  }
};

var AI = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
    this.getSpeed = function() { return 100; }
}

AI.prototype = {
//    getSpeed : function() { return 100; },
    act : function() {
    var x = Game.player.getX();
    var y = Game.player.getY();

    var passableCallback = function(x, y) {
        return (x+","+y in Game.map);
    }
    var astar = new ROT.Path.AStar(x, y, passableCallback, {topology:4});

    var path = [];
    var pathCallback = function(x, y) {
        path.push([x, y]);
    }
    astar.compute(this._x, this._y, pathCallback);

    path.shift();
    if (path.length == 1) {
        Game.engine.lock();
        alert("Game over - you were captured by the enemy!");
    } else {
        x = path[0][0];
        y = path[0][1];
        Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
        this._x = x;
        this._y = y;
        this._draw();
      }
    },
  _draw : function() {
    Game.display.draw(this._x, this._y, "P", "red");
  }
};
