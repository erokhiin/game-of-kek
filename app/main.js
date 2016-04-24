import './App.css';

const heroes = {
  knight: require('./units/knight').default
};

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

function player({ x, y, r, c, dx, dy, a, k, n }) {
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

  const frame = heroes[n][dir];
  const pixel = Math.ceil(r * 1.25 * Math.SQRT2 / 12);
  const offset = pixel * 6;

  ctx.save();
  ctx.translate(Math.ceil(x) - offset, Math.ceil(y) - offset);
  for (let i = 0; i < (frame.length * k / 100); i ++) {
    for (let j = 0; j < frame[i].length; j ++) {
      if (frame[i][j] === 0) continue;
      ctx.fillStyle = frame[i][j] === 'brand' ? c : frame[i][j];
      ctx.fillRect(j * pixel, i * pixel, pixel, pixel);
    }
  }
  ctx.restore();

  if (a) {
    ctx.save();
      
    ctx.translate(Math.ceil(x), Math.ceil(y));

    let alpha = Math.acos(cos);
    const dalpha = Math.PI / 4;

    if (sin < 0) {
      alpha = -alpha;
    }

    ctx.beginPath();
    ctx.arc(0, 0, r * 1.4, alpha - dalpha, alpha + dalpha);

    const d = r * 1.4 * Math.cos(dalpha);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.arc(dx * d, dy * d, r * 1.4 * Math.sin(dalpha), alpha + Math.PI / 2, alpha - Math.PI / 2, true);
    ctx.fill();

    ctx.restore();
  }
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
    ws.send(JSON.stringify({
      type: 'auth',
      auth: 'host-hiuhdajdas23442',
      data: {
        h: window.innerHeight,
        w: window.innerWidth,
      }}))
  }
}

main();
