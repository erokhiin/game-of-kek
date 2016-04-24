'use strict';
/* eslint no-console: 0 */

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const config = require('./webpack.config.js');
const ws = require('ws');
const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;
const server = require('http').createServer();
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ server: server });

const app = express();
let isFirst = true;

if (isDeveloping) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.get('/room', function response(req, res) {
    console.log('i work');
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end();
  });

  app.get('/pad', function response(req, res) {
    console.log('i work');
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/pad.html')));
    res.end();
  });
} else {
  app.use(express.static(__dirname + '/dist'));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

var letters = '0123456789ABCDEF'.split('');
function getRandomColor() {
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const FPS = 1000/60;

class World {
  constructor(w, h) { // in points (px)
    this.h = h;
    this.w = w;
    this.objs = [];
  }

  add(obj) {
    this.objs.push(obj);
  }

  setIn(obj) {
    if (obj.type == 'circle' || obj.type == 'player') {
      obj.x = Math.min(Math.max(0 + obj.r, obj.x), this.w - obj.r);
      obj.y = Math.min(Math.max(0 + obj.r, obj.y), this.h - obj.r);
    } else if (obj.type == 'rect') {
      obj.x = Math.min(Math.max(0 + obj.w / 2, obj.x), this.w - obj.w / 2);
      obj.y = Math.min(Math.max(0 + obj.h / 2, obj.y), this.h - obj.h / 2);
    }
  }
}

class Obj {
  constructor(x, y, c, isStatic) {
    this.x = x;
    this.y = y;
    this.c = c;
    this.isStatic = isStatic === undefined ? true : isStatic;
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      c: this.c,
      t: 'obj',
    }
  }
}

class Rect extends Obj {
  constructor(x, y, w, h, c, isStatic) {
    super(x, y, c, isStatic);
    this.w = w;
    this.h = h;
    this.type = 'rect';
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      c: this.c,
      t: this.type,
    }
  }
}

class Circle extends Obj {
  constructor(x, y, r, c, isStatic) {
    super(x, y, c, isStatic);

    this.r = r;
    this.type = 'circle';
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      r: this.r,
      c: this.c,
      t: this.type,
    }
  }
}

class Player extends Circle {
  constructor(ws, x, y, r, c, speed, ats) { // speed in points per second, atack speed raz per second
    super(x, y, r, c, false);
    this.ws = ws;

    this.speed = speed;

    this.type = 'player';
    this.dx = 0;
    this.dy = 0;

    this.dirX = 0;
    this.dirY = 1;

    // hit vars
    this.as = ats;
    this.sendHit = false;
    this.timeLastHit = 0.0;
  }

  hit(cs) {
    this.isHit = cs == 'down';
  }

  setDirection(dx, dy) {
    this.dx = dx;
    this.dy = dy;

    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
      const n = this.normalize(this.dx, this.dy);

      this.dirX = n.x;
      this.dirY = n.y;
    }
  }

  update(world, dtTime) {
    let dt = { 
      dx: (this.dx * dtTime * this.speed / 1000),
      dy: (this.dy * dtTime * this.speed / 1000),
    };

    dt = world.objs.reduce((dt, obj) => this !== obj ? this.hitTest(obj, dt.dx, dt.dy) : dt, dt);

    if (this.isHit && this.timeLastHit > this.as * 1000) {
      this.timeLastHit = 0.0;
      this.sendHit = true;
    }

    this.timeLastHit += dtTime;

    this.x += dt.dx;
    this.y += dt.dy;

    world.setIn(this);
  }

  normalize(x, y) {
    const d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    return { x: x / d, y : y / d };
  }

  toJSON() {
    const a = this.sendHit;

    this.sendHit = false;

    return Object.assign(super.toJSON(), {
      dx: this.dirX,
      dy: this.dirY,
      t: this.type,
      a: a,
    });
  }

  hitTest(obj, dx, dy) {
    switch (obj.type) {
      case 'circle': {
        let x = this.x + dx;
        let y = this.y + dx;
        let r2 = this.r + obj.r;
        const dist = Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2));
        if (dist < r2) {

          const newY = obj.y + (y - obj.y) * (r2 + 1) / dist;
          const newX = obj.x + (x - obj.x) * (r2 + 1) / dist;
          
          return { dx: newX - this.x, dy: newY - this.y  };
        } else {
          return { dx, dy };
        }
      }

      case 'rect': {
        return { dx, dy }
      }
    }
  }
}

class Game {
  constructor(world, dws) {
    this.dws = dws;
    this.world = world;
  }

  start() {
    let oldTime;
    this.id = setInterval(() => {
      const now = Date.now();
      const dtTime = oldTime ? now - oldTime : 0;
      oldTime = now;

      this.update(dtTime);
      this.send();
    }, FPS);
  }

  stop() {
    clearInterval(this.id);
    delete this.id;
  }

  update(dtTime) {
    this.world.objs.filter(obj => !obj.isStatic).forEach(obj => {
      obj.update(this.world, dtTime);
    });
  }

  send() {
    this.dws.send(JSON.stringify({
      type: 'update',
      data: this.world.objs
    }))
  }
}

const world = new World(600, 400);
let game;

wss.on('connection', function(ws) {
  ws.once('message', function(message) {
    const msg = JSON.parse(message);

      switch (msg.type) {
        case 'auth':
          initClient(msg.data, ws);
          break;
        default:
          ws.close();
      }
  });
});

function initClient(auth, ws) {
  switch (auth) {
    case 'pad-hiuhdajdas23442': 
      initPad(ws);
      break;
    case 'host-hiuhdajdas23442':
      initHost(ws);
      break;
    default:
      ws.close();
  }
}

function initPad(ws) {
    // pad
  console.log('add pad');
  const playerColor = getRandomColor();
  const player = new Player(ws, 300, 300, 25, playerColor, 400, 1);
  world.add(player);
  
  ws.on('message', function incoming(message) {
    const msg = JSON.parse(message);

    switch (msg.type) {
      case 'nipple': 
        player.setDirection(msg.data.x, msg.data.y);
        break;
      case 'btn':
        player.hit(msg.data);
        break;
    }
  });

  ws.send(JSON.stringify({
    type: 'init',
    data: {
      color: playerColor,
    }
  }));
}

function initHost(ws) {
  if (!game) {
    game = new Game(world, ws);
    game.start();

    // comp
    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
    });

    ws.send(JSON.stringify({
      type: 'init',
      data: {
        width: world.w,
        height: world.h,
      }
    }));
  }
}

server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });