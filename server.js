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
const isFirst = false;

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
    console.log(isFirst);
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, !isFirst ? 'dist/index.html' : 'dist/pad.html')));
    isFirst = false;
    console.log(isFirst);
    res.end();
  });
} else {
  app.use(express.static(__dirname + '/dist'));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

const FPS = 1000/10;

class World {
  constructor(h, w) { // in points (px)
    this.h = h;
    this.w = w;
    this.objs = [];
  }

  add(obj) {
    this.objs.push(obj);
  }

  setIn(obj) {
    obj.x = Math.min(Math.max(0, obj.x), this.w);
    obj.y = Math.min(Math.max(0, obj.y), this.h);
  }
}

class Obj {
  constructor(x, y, h, w, isStatic) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.w = w; 
    this.isStatic = isStatic === undefined ? true : isStatic;
  }
}

class Player extends Obj {
  constructor(ws, x, y, h, w, speed) { // speed in points per second
    super(x, y, h, w, false);
    this.ws = ws;

    this.speed = speed;

    this.dx = 0;
    this.dy = 0;
  }

  setDirection(dx, dy) {
    if (dx < dy) {
      this.dy = dy;
      this.dx = 0;   
    } else if (dx > dy) {
      this.dx = dx;
      this.dy = 0; 
    } else if (dx == dy && !dx) {
      dx
    }
  }

  update(world, statics, dtTime) {

  }
}

class Game {
  constructor(world, dws) {
    this.dws = dws;
    this.world = world;
  }

  run() {
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
    const sObj = this.world.objs.filter(obj => objs.isStatic);
    this.world.objs.filter(obj => !objs.isStatic).forEach(obj => {
      obj.update(this.world, sObj, dtTime);
    });
  }

  send() {

  }
}

wss.on('connection', function connection(ws) {
  
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});


server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });