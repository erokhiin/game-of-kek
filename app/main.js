import './App.css';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

function init({width, height}) {
  canvas.width = width;
  canvas.height = height;
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function rect({x, y, w, h, c}) {
  ctx.save();
  ctx.translate(-w/2, -h/2);
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function circle({x, y, r, c}) {
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = c;
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

function update(objs) {
  clear();

  objs.forEach(obj => {
    switch (obj.t) {
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

  ws.onmessage = function({data}) {
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

    // ws.send(JSON.stringify({hello: 'world'}));
  }
}

main();
