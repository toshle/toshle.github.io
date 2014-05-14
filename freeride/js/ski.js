function init() {
  var canvas = document.getElementById('canvas');
  if (canvas !== null && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    console.log("ctx created");
    build(ctx, canvas);
  } else {
    alert("Problem creating canvas 2D drawing context");
  }
}

function build(ctx, canvas) {
  var ev = {
    player: undefined,
    horizontalOffset: 0,
    verticalOffset: 0,
    time: 0,
    speed: 1,
    ctx: ctx,
    canvas: canvas,
    playerImage: "img/player.png",
    obstacles: [],
    difficulty: 0,
    points: 0,
    multiplier: 0,
    debug: false,
    gameOver: false,
  }
  window.addEventListener("keydown", move, false);
  window.addEventListener("keyup", refresh, false);

  function refresh(e) {
    ev.playerImage = "img/player.png";
    //ev.verticalOffset = 0;
  }

  function move(e) {
    if (e.keyCode == 37) {
      if (ev.horizontalOffset > -300) {
        ev.horizontalOffset -= ev.speed + 4;
      }
      ev.playerImage = "img/playerLeft.png";
    }
    if (e.keyCode == 38) {
      if (ev.verticalOffset > -30) {
        ev.verticalOffset -= 2;
        ev.speed += 1;
      }
    }
    if (e.keyCode == 39) {
      if (ev.horizontalOffset < 300) {
        ev.horizontalOffset += ev.speed + 4;
      }
      ev.playerImage = "img/playerRight.png";
    }
    if (e.keyCode == 40) {
      if (ev.verticalOffset < 0) {
        ev.verticalOffset += 2;
        ev.speed -= 1;
      }
    }
  }
  gameLoop(ev);
}

function gameLoop(ev) {
  var vx = 0;
  var vt = 0;
  var d = new Date();
  var t = d.getTime();

  (function renderGame() {
    loop = window.requestAnimationFrame(renderGame);

    if (!ev.gameOver) {
      ev.ctx.clearRect(0, 0, ev.canvas.width, ev.canvas.height);
      drawMap(ev.ctx, vx);
      spawnPlayer(ev);
      createObstacles(ev, ev.speed);
      drawGUI(ev);
      if (Math.abs(vx) > 64) {
        vx = 0;
      }
      if (Math.abs(vt) > 10) {
        vt = 0;
      }
      vx -= ev.speed;
      vt += ev.speed;
      ev.points += 1 * (ev.speed / 50) + ev.multiplier;
      var date = new Date();
      ev.time = date.getTime() - t;
      if (ev.time % 7 == 0) {
        ev.multiplier += 1;
      }
    } else {
      window.cancelAnimationFrame(loop);
      ev.ctx.fillStyle = "#FF0000";
      ev.ctx.font = "30px Arial";
      ev.ctx.fillText("Game Over", 240, 80);
      loop = undefined;
      var name = prompt("Please enter your name");
      if(name == null || name == "") {
        name = "Stranger";
      }
      var highscore = localStorage.getItem("highscore");
      if (highscore == null) {
        var highscore = new Array();
        highscore.push({
          player: name,
          points: Math.floor(ev.points)
        })
      } else {
        highscore = JSON.parse(highscore);
        highscore.push({
          player: name,
          points: Math.floor(ev.points)
        });
      }
      localStorage.removeItem("highscore");
      var row = 0;
      ev.ctx.fillStyle = "#000000";
      ev.ctx.font = "30px Arial";
      ev.ctx.fillText("Highscore", 250, 130 + row * 30);
      highscore.sort(function(a, b) {
        return b.points - a.points
      }).slice(0, 10).forEach(function(entry) {
        ev.ctx.fillText(row + 1, 160, 170 + row * 30);
        ev.ctx.fillText(Math.floor(entry.points), 210, 170 + row * 30);
        ev.ctx.fillText(entry.player, 370, 170 + row * 30);
        row += 1;
      });
      console.log(highscore);
      localStorage.setItem("highscore", JSON.stringify(highscore));
    }
  }());


}

function spawnPlayer(ev) {
  ev.player = entities.create("player", 320 + ev.horizontalOffset, 360 + ev.verticalOffset, 64, 64, ev.playerImage);
  ev.player.draw(ev);
}

function createObstacles(ev, offset) {
  if (Math.floor((Math.random() * 100) + 1) > 80 && ev.obstacles.length < 60) {
    for (i = 0; i < 50; i += 10) {
      if (Math.floor((Math.random() * 100) + 1) > 80 && ev.obstacles.length < 60) {
        ev.obstacles.push(entities.create("tree", Math.floor((Math.random() * 640) + 1), -64, 32, 32, "img/tree.png"));
      }
    }
  }
  spawnObstacles(ev, offset);
}

function spawnObstacles(ev, offset) {
  ev.obstacles.forEach(function(entry) {
    entry.draw(ev);
    detectCollision(entry);
    if (entry.y < 640) {
      entry.translate(0, offset);
    } else {
      delete entry;
      ev.obstacles.shift();
    }
  });

  function detectCollision(object) {
    if (ev.player.x > object.x - 12 && ev.player.x < object.x + 12) {
      if (ev.player.y > object.y - 12 && ev.player.y < object.y + 12) {
        if (ev.debug) {
          ev.ctx.strokeStyle = "#FF0000";
          ev.ctx.strokeRect(ev.player.x - 16, ev.player.y - 16, 32, 32);
        }
        ev.multiplier = 0;
        ev.gameOver = true;
      }
    }
    if (ev.player.x > object.x - 22 && ev.player.x < object.x + 22) {
      if (ev.player.y > object.y - 22 && ev.player.y < object.y + 22) {
        if (ev.debug) {
          ev.ctx.strokeStyle = "#FFFF00";
          ev.ctx.strokeRect(ev.player.x - 16, ev.player.y - 16, 32, 32);
        }
        ev.ctx.fillStyle = "#FF0000";
        ev.ctx.font = "25px Arial";
        ev.ctx.fillText("Too close!", 260, 50);
        ev.multiplier += 1;
      }
    }
  }
}

function drawGUI(ev) {
  // ev.ctx.fillStyle = "#d3d3d3";
  // ev.ctx.fillRect(0, ev.canvas.height - 99, ev.canvas.width, 100);
  ev.ctx.fillStyle = "#000000";
  // ev.ctx.strokeRect(0, ev.canvas.height - 99, ev.canvas.width, 100);
  ev.ctx.font = "16px Arial";
  ev.ctx.fillText("Points: " + Math.floor(ev.points), 10, 30);
  ev.ctx.fillText("Speed: " + ev.speed, 10, 50);
  ev.ctx.fillText("Bonus: +" + ev.multiplier, 10, 70);
  ev.ctx.fillText("Time: " + Math.floor(ev.time / 600), 10, 90);
}

function drawMap(ctx, offset) {
  var x = 0,
    y = -128;
  image = new Image();

  for (var j = 0; j < 100; j++) {
    image.src = 'img/snow.png';
    if (x == 640) {
      x = 0;
      y += 64;
    }
    ctx.globalAlpha = 0.5;
    ctx.drawImage(image, x, y - offset);
    ctx.globalAlpha = 1.0;
    x += 64;
  }
}

function drawMap1(ctx, offset) {

  var y = -64;
  var x = 0;
  image = new Image();

  function drawRow() {
    for (var j = 0; j < 10; j++) {
      image.src = 'img/snow.png';
      ctx.globalAlpha = 0.5;
      ctx.drawImage(image, x, y - offset);
      ctx.globalAlpha = 1.0;
      x += 64;
    }
    x = 0;
  }
  drawRow();
}

var eventable = function(that) {
  var registry = {};
  that.fire = function(event) {
    var array, func, handler, i,
      type = typeof event === 'string' ? event : event.type;
    if (registry.hasOwnProperty(type)) {
      array = registry[type];
      for (i = 0; i < array.length; i++) {
        handler = array[i];
        func = handler.method;
        if (typeof func === 'string') {
          func = this[func];
        }
        func.apply(this, handler.parameters || [event]);
      }
    }
    return this;
  };

  that.on = function(type, method, parameters) {
    var handler = {
      method: method,
      parameters: parameters
    };
    if (registry.hasOwnProperty(type)) {
      registry[type].push(handler);
    } else {
      registry[type] = [handler];
    }
    return this;
  };
  return that;
};

var entities = function() {
  function Entity(name, sx, sy, width, height, imageURL) {
    this.name = name || "unnamed";
    this.x = sx || 0;
    this.y = sy || 0;
    this.width = width || 0;
    this.height = height || 0;
    this.image = imageURL || "";
    eventable(this);
  }
  Entity.prototype.toString = function() {
    return this.name + " (x: " + this.x + ", y: " + this.y + ") ";
  };
  Entity.prototype.translate = function(dx, dy) {
    this.x += dx;
    this.y += dy;
    if (this.fire) {
      this.fire({
        type: 'translate',
        payload: this.toString()
      });
    }
    return this;
  };
  Entity.prototype.draw = function(ev) {
    var img = new Image();
    img.src = this.image;
    //console.log(this.image);
    ev.ctx.drawImage(img, 0, 0, this.width, this.height, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    if (ev.debug) {
      ev.ctx.strokeStyle = "#00FF00";
      ev.ctx.strokeRect(this.x - 16, this.y - 16, 32, 32);
    }

  };

  return {
    create: function(name, x, y, width, height, imageURL) {
      //console.log(name + " created at (" + x + ", " + y + ")");
      return new Entity(name, x, y, width, height, imageURL);
    }
  };
}();