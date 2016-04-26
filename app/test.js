import Circle from './circle';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

function init({width, height}) {
  canvas.width = width;
  canvas.height = height;
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

let world = [];

function update(objs) {
    // console.log(objs);
    objs.forEach(obj => {
        const c = world.find(o => o.id === obj.i);

        if (c) {
            console.log(c, {x: obj.x, y: obj.y, dx: obj.a, dy: obj.b});
            Object.assign(c, {x: obj.x, y: obj.y, dx: obj.a, dy: obj.b});
        } else {
            const newO = new Circle(obj.x, obj.y, obj.i);
            newO.setD(obj.a, obj.b);

            world.push(newO);
        }
    });
}

let oldTime;
function run() {
    const now = Date.now();
    const dtTime = oldTime ? now - oldTime : 0;
    oldTime = now;

    clear();

    world.forEach(obj => {
        obj.update(dtTime);
        obj.render(ctx);
    })

    requestAnimationFrame(run);
}

function main() {
  const ws = new WebSocket(`ws://${location.host}`);

  ws.onmessage = function({ data }) {
    const msg = JSON.parse(data);

    switch (msg.type) {
      case 'init':
        init(msg.data);
        requestAnimationFrame(run);
        break;
      case 'update':
        update(msg.data);
        console.log('update');
        break;
      default:
        throw Error(`Unknown event type: ${msg.type}`);
    }
  }

  ws.onopen = function() {
    ws.send(JSON.stringify({
      type: 'auth',
      auth: 'host-hiuhdajdas23442'
    }))
  }
}

main();

window.world = world;