'use strict';
/* eslint no-console: 0 */

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const Color = require('color');
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

function getRandomColor() {
  return new Color({ h: Math.floor(Math.random() * 360), s: 100, l: 60 }).rgbString();
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

  remove(obj) {
    this.objs = this.objs.filter(o => o !== obj);
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
  constructor(ws, x, y, r, c, speed, ats, name) { // speed in points per second, atack speed raz per second
    super(x, y, r, c, false);
    this.ws = ws;

    this.speed = speed;

    this.name = name;
    this.type = 'player';
    this.dx = 0;
    this.dy = 0;

    this.dirX = 0;
    this.dirY = 1;

    // hit vars
    this.as = ats;
    this.sendHit = false;
    this.sendFor = 250;
    this.timeLastSend = 0.0;

    this.timeLastHit = 0.0;

    // dead vars
    this.dead = false;
    this.deadTime = 1000;
    this.hp = 100;
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

  rotate(x, y, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const nx = (cos * x) + (sin * y);
    const ny = (cos * y) - (sin * x);

    return {x: nx, y: ny};
  }

  isAttack(objs) {
    // const len = Math.sqrt(Math.pow(this.dirX, 2) + Math.pow(this.dirY, 2));
    // const cos = this.dirX / len;
    // const sin = this.dirY / len;

    // let alpha = Math.acos(cos);
    // const dalpha = Math.PI / 4;

    // if (sin < 0) {
    //   alpha = -alpha;
    // }

    // console.log(alpha);

    // const points = [
    //   this.rotate(this.dirX, this.dirY, alpha),
    //   this.rotate(this.dirX, this.dirY, alpha + dalpha),
    //   this.rotate(this.dirX, this.dirY, alpha - dalpha),
    // ].map(dt => ({
    //   x: this.x + dt.x * this.r * 1.4,
    //   y: this.y + dt.y * this.r * 1.4,
    // }));

    const points = [{
      x: this.x + this.dirX * this.r * 1.45,
      y: this.y + this.dirY * this.r * 1.45,
    }];

    this.points = points;

    objs.forEach(obj => {
      if (obj !== this) {
        points.forEach(point => {
          const dist = Math.sqrt(Math.pow(obj.x - point.x, 2) + Math.pow(obj.y - point.y, 2));
          if (dist < obj.r + 15) {
            obj.kill();
          }
        });
      }
    });
  }

  kill() {
    this.dead = true;
    this.ws.send(JSON.stringify({type: 'disable'}));
  }

  update(world, dtTime) {
    let dt = {
      dx: (this.dx * dtTime * this.speed / 1000),
      dy: (this.dy * dtTime * this.speed / 1000),
    };

    dt = world.objs.reduce((dt, obj) => this !== obj ? this.hitTest(obj, dt.dx, dt.dy) : dt, dt);

    if (!this.dead) {
      if (this.isHit && this.timeLastHit > this.as * 1000) {
        this.timeLastHit = 0.0;
        this.timeLastSend = 0.0;
        this.isAttack(world.objs);

        this.sendHit = true;
      }

      if (this.timeLastSend > this.sendFor) {
        this.sendHit = false;
      }
    } else {
      this.hp -= dtTime / this.deadTime * 100;
    }

    this.timeLastSend += dtTime;
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
    return Object.assign(super.toJSON(), {
      dx: this.dirX,
      dy: this.dirY,
      t: this.type,
      a: this.sendHit,
      k: this.hp,
      n: this.name,
      p: this.points,
    });
  }

  hitTest(obj, dx, dy) {
    switch (obj.type) {
      case 'player':
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
    this.dws = [dws];
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

  initHost(ws) {
    ws.send(JSON.stringify({
      type: 'init',
      data: {
        width: this.world.w,
        height: this.world.h,
      }
    }));
  }

  addHost(ws) {
    this.dws.push(ws);
  }

  removeHost(ws) {
    this.dws = this.dws.filter(s => ws !== s);
  }

  stop() {
    clearInterval(this.id);
    delete this.id;
  }

  update(dtTime) {
    this.world.objs.filter(obj => !obj.isStatic).forEach(obj => {
      obj.update(this.world, dtTime);
    });

    this.world.objs = this.world.objs.filter(obj => obj.hp > 5);
  }

  send() {
    const world = JSON.stringify({
      type: 'update',
      data: this.world.objs
    });

    this.dws.forEach(ws => {
      if (ws.readyState == 1) {
        ws.send(world);
      }
    });
  }
}

let world;
let game;

wss.on('connection', function(ws) {
  ws.once('message', function(message) {
    const msg = JSON.parse(message);

      switch (msg.type) {
        case 'auth':
          initClient(msg.auth, msg.data, ws);
          break;
        default:
          ws.close();
      }
  });
});

function initClient(auth, data, ws) {
  switch (auth) {
    case 'pad-hiuhdajdas23442':
      initPad(ws);
      break;
    case 'host-hiuhdajdas23442':
      initHost(ws, data);
      break;
    default:
      ws.close();
  }
}

const heroes = [ 'knight', 'thief', 'wizard' ];
const playerSize = 25;

function initPad(ws) {
    // pad
  console.log('add pad');
  const playerColor = getRandomColor();
  const player = new Player(ws, Math.round(Math.random() * world.w - playerSize), Math.round(Math.random() * world.h - playerSize), playerSize, playerColor, 400, 1, heroes[Math.round(Math.random() * (heroes.length - 1))]);
  world.add(player);

  ws.on('close', function() {
    world.remove(player);
  });

  ws.on('message', function(message) {
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

function initHost(ws, data) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.on('close', function() {
    game.removeHost(ws);
  });

  if (!game) {
    world = new World(data.w, data.h);
    game = new Game(world, ws);
    game.start();
  }

  game.addHost(ws);
  game.initHost(ws);
}

server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });
