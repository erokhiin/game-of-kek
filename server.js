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
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, isFirst ? 'dist/index.html' : 'dist/pad.html')));
    isFirst = false;
    res.end();
  });
} else {
  app.use(express.static(__dirname + '/dist'));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

const FPS = 1000/50;

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
    if (obj.type == 'circle') {
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
  constructor(ws, x, y, r, c, speed) { // speed in points per second
    super(x, y, r, c, false);
    this.ws = ws;

    this.speed = speed;

    this.dx = 0;
    this.dy = 0;
  }

  setDirection(dx, dy) {
    this.dx = dx;
    this.dy = dy;
  }

  update(world, dtTime) {
    let dt = { 
      dx: (this.dx * dtTime * this.speed / 1000),
      dy: (this.dy * dtTime * this.speed / 1000),
    };

    dt = world.objs.reduce((dt, obj) => this !== obj ? this.hitTest(obj, dt.dx, dt.dy) : dt, dt); 

    this.x += dt.dx;
    this.y += dt.dy;

    world.setIn(this);
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

let isFirstForSockets = true;
wss.on('connection', function connection(ws) {
  if (isFirstForSockets) {
    isFirstForSockets = false;

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
  } else {
    // pad
    console.log('add pad');
    const player = new Player(ws, 300, 300, 50, '#ff0000', 200);
    world.add(player);
    
    ws.on('message', function incoming(message) {
      const msg = JSON.parse(message);

      switch (msg.type) {
        case 'nipple': 
          player.setDirection(msg.data.x, msg.data.y);
          break;
      }
    });

    ws.send('something');
  }
});


server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });