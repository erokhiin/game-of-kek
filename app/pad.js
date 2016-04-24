import './pad.css';

// let intervalId;
let socket = new WebSocket(`ws://${location.host}`);

let disabled = true;

function enable(color) {
  disabled = false;
  document.body.style.backgroundColor = color;
}

function disable() {
  disabled = true;
  document.body.style.backgroundColor = '#ccc';
}

socket.onopen = function() {
  socket.send(JSON.stringify({type: 'auth', auth: 'pad-hiuhdajdas23442'}))
}

socket.onmessage = function({data}) {
  const msg = JSON.parse(data);
  switch (msg.type) {
    case 'init':
      enable(msg.data.color);
      break;
    case 'disable':
      disable();
  }
};

socket.onerror = function() {
  console.log('error');
  disable();
};

// blocks

const boob = document.querySelector('.pad__boob');
const nipple = document.querySelector('.pad__nipple');
const btn = document.querySelector('.pad__btn');
let nippleSide;
let nippleTouch;
let btnTouch;
let boobR;
let boobInR;

// nipple

function posNipple({ x: x, y: y }) {
  nipple.style.top = y + 'px';
  nipple.style.left = x + 'px';
}

function checkIntersection(el, x, y, r, rm = 0) {
  const _x = x - el.offsetLeft;
  const _y = y - el.offsetTop;
  if (Math.pow(_x - r + rm, 2) + Math.pow(_y - r + rm, 2) < Math.pow(r, 2)) {
    return { x: _x, y: _y };
  } else {
    return false;
  }
}

function handleNippleTouch(touch) {
  let intersection = checkIntersection(boob, touch.pageX, touch.pageY, boobInR, -(nipple.offsetWidth / 2));
  if (!intersection) {
    const x1 = boob.offsetLeft + boobR;
    const y1 = boob.offsetTop + boobR;
    const x2 = touch.pageX;
    const y2 = touch.pageY;
    const d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    intersection = {
      x: ((x2 - x1) / d * boobInR) + boobR,
      y: ((y2 - y1) / d * boobInR) + boobR
    };
  }
  posNipple(intersection);
  socket.send(JSON.stringify({
    type: 'nipple',
    data: {
      x: (intersection.x - boobR) / boobInR,
      y: (intersection.y - boobR) / boobInR
    }
  }));
}

function upButton() {
  btnTouch = false;
  btn.classList.remove('i-active');
  socket.send(JSON.stringify({
    type: 'btn',
    data: 'up'
  }));
}

document.addEventListener('touchstart', function() {
  if (disabled) {
    location.reload();
  }
};

boob.addEventListener('touchstart', function(e) {
  if (nippleTouch || disabled) return;
  nipple.classList.add('i-active');
  nipple.classList.remove('i-back');
  nippleTouch = e.targetTouches[e.targetTouches.length - 1].identifier;
  handleNippleTouch(e.targetTouches[e.targetTouches.length - 1]);
}, false);

btn.addEventListener('touchstart', function(e) {
  if (disabled) return;
  btn.classList.add('i-active');
  btnTouch = e.targetTouches[e.targetTouches.length - 1].identifier;
  socket.send(JSON.stringify({
    type: 'btn',
    data: 'down'
  }));
}, false);

window.addEventListener('touchmove', function(e) {
  e.preventDefault();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    switch(touch.identifier) {
      case nippleTouch:
        handleNippleTouch(touch);
        break;
      case btnTouch:
        if (!checkIntersection(btn, touch.pageX, touch.pageY, btn.offsetWidth / 2)) {
          upButton();
        }
        break;
    }
  }
}, false);

window.addEventListener('touchend', function(e) {
  for (let i = 0; i < e.changedTouches.length; i++) {
    switch(e.changedTouches[i].identifier) {
      case nippleTouch:
        nippleTouch = false;
        nipple.classList.add('i-back');
        nipple.classList.remove('i-active');
        posNipple({ x: boobR, y: boobR });
        socket.send(JSON.stringify({
          type: 'nipple',
          data: { x: 0, y: 0 }
        }));
        break;
      case btnTouch:
        upButton();
        break;
    }
  }
}, false);

// resize

function resize() {
  boob.style.width = boob.offsetHeight + 'px';
  boob.style.left = boob.offsetTop + 'px';
  btn.style.width = btn.offsetHeight + 'px';
  btn.style.right = boob.style.left;
  nippleSide = nipple.offsetWidth;
  boobR = boob.offsetWidth / 2;
  boobInR = boobR - nipple.offsetWidth / 2
  nipple.style.marginLeft = nipple.style.marginTop = (- nippleSide / 2) + 'px';
  if (!nippleTouch) {
    posNipple({ x: boobR, y: boobR });
  }
};

resize();

window.addEventListener('resize', resize);
