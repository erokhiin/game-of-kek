import './App.css';
import knight from './units/knight';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

function init({width, height}) {
  canvas.width = width;
  canvas.height = height;
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function rect({ x, y, w, h, c }) {
  ctx.save();
  ctx.translate(-w/2, -h/2);
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function circle({ x, y, r, c, a }) {
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = c;
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

function player({ x, y, r, c, dx, dy, a }) {
  let dir;
  const len = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  const cos = dx / len;
  const sin = dy / len;

  if (cos >= Math.SQRT1_2) {
    dir = 'right';
  } else if (cos <= - Math.SQRT1_2) {
    dir = 'left';
  }

  if (sin >= Math.SQRT1_2) {
    dir = 'down';
  } else if (sin <= - Math.SQRT1_2) {
    dir = 'up';
  }

  knight(ctx, x, y, r, c, dir);
}

function update(objs) {
  clear();

  objs.forEach(obj => {
    switch (obj.t) {
      case 'player':
        player(obj);
        break;
      case 'circle':
        circle(obj);
        break;
      case 'rect':
        rect(obj);
        break;
    }
  });
}

function main() {
  const ws = new WebSocket('ws://localhost:3000');

  ws.onmessage = function({ data }) {
    const msg = JSON.parse(data);

    switch (msg.type) {
      case 'init':
        init(msg.data);
        break;
      case 'update':
        update(msg.data);
        break;
      default:
        throw Error(`Unknown event type: ${msg.type}`);
    }
  }

  ws.onopen = function() {
    ws.send(JSON.stringify({type: 'auth', data: 'host-hiuhdajdas23442'}))
  }
}

main();
