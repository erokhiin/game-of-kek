'use strict';
/* eslint no-console: 0 */

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const Color = require('color');
const webpackMiddleware = require('webpack-dev-middleware');
const config = require('./webpack.config.js');
const ws = require('ws');
const port = 3000;
const server = require('http').createServer();
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ server: server });
const FPS = 1000/30;
const app = express();

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
  res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/test.html')));
  res.end();
});

app.get('/pad', function response(req, res) {
  console.log('i work');
  res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/pad.html')));
  res.end();
});



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

const Circle = require('./app/circle');

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
    this.world.objs.forEach(obj => {
      obj.update(dtTime);
    });
  }

  send() {
    const obj = this.world.objs.filter(obj => obj.invalid);

    if (obj.length) {
      const world = JSON.stringify({
        type: 'update',
        data: obj
      });

      this.dws.forEach(ws => {
        if (ws.readyState == 1) {
          ws.send(world);
        }
      });

      obj.forEach(o => o.setValid());
    }
  }
}

let world;
let game;



function initClient(auth, data, ws) {
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
  const pl = new Circle(60, 60);
  world.add(pl); 

  ws.on('close', function() {
    world.remove(pl)
  });

  ws.on('message', function(message) {
    const msg = JSON.parse(message);

    switch (msg.type) {
      case 'nipple':
        pl.setD(msg.data.x, msg.data.y);
        break;
      case 'btn':
        // player.hit(msg.data);
        break;
    }
  });

  ws.send(JSON.stringify({
    type: 'init',
    data: {
      color: '#fff',
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
    world = new World(600, 600);
    game = new Game(world, ws);
    game.start();
  }

  game.addHost(ws);
  game.initHost(ws);
}

server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });