import './pad.css';

const socket = new WebSocket('ws://localhost:3000/room');

window.addEventListener('load', function() {

  // blocks

  const nippleWrap = document.querySelector('.pad__nipple-wrap');
  const nipple = document.querySelector('.pad__nipple');
  const btn = document.querySelector('.pad__btn');
  let nippleSide;
  let nippleTouch;
  let btnTouch;
  let nippleR;

  // nipple

  function posNipple({ x: x, y: y }) {
    nipple.style.top = y + 'px';
    nipple.style.left = x + 'px';
  }

  function checkIntersection(el, x, y, rm = 0) {
    const _x = x - el.offsetTop;
    const _y = y - el.offsetLeft;
    const _r = nippleR + rm;

    if (Math.pow(_x - _r + rm, 2) + Math.pow(_y - _r + rm, 2) < Math.pow(_r, 2)) {
      return { x: _x, y: _y };
    } else {
      return false; 
    }
  }

  nippleWrap.addEventListener('touchstart', function(e) {
    nippleTouch = e.targetTouches[e.targetTouches.length - 1].identifier;
  }, false);

  btn.addEventListener('touchstart', function(e) {
    btnTouch = e.targetTouches[e.targetTouches.length - 1];
  }, false);

  window.addEventListener('touchmove', function(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      switch(touch.identifier) {
        case nippleTouch:
          let intersection = checkIntersection(nippleWrap, touch.pageX, touch.pageY, -(nipple.offsetWidth / 2));
          if (!intersection) {
            const _r = nippleR - nipple.offsetWidth / 2;
            const x1 = nippleWrap.offsetLeft + _r;
            const y1 = nippleWrap.offsetTop + _r;
            const x2 = touch.pageX;
            const y2 = touch.pageY;
            const d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            intersection = {
              x: ((x2 - x1) / d * _r) + nippleR,
              y: ((y2 - y1) / d * _r) + nippleR
            };
          }
          posNipple(intersection);
          const _r = nippleR - nipple.offsetWidth / 2;
          socket.send(JSON.stringify({
            type: 'nipple',
            data: {
              x: (intersection.x - nippleR) / _r,
              y: (intersection.y - nippleR) / _r
            }
          }));
          break;

        case btnTouch:

          break;

      }
    }
  }, false);

  window.addEventListener('touchend', function(e) {
    // console.log(e);
    console.log('end');
  }, false);


  //


  // resize

  function resize() {
    nippleWrap.style.width = nippleWrap.offsetHeight + 'px';
    nippleWrap.style.left = nippleWrap.offsetTop + 'px';
    btn.style.width = btn.offsetHeight + 'px';
    btn.style.right = nippleWrap.style.left;
    nippleSide = nipple.offsetWidth;
    nippleR = nippleWrap.offsetWidth / 2;
    nipple.style.marginLeft = nipple.style.marginTop = (- nippleSide / 2) + 'px';
    if (!nippleTouch) {
      posNipple({ x: nippleR, y: nippleR });
    }
  };

  resize();

  window.addEventListener('resize', resize);

});
