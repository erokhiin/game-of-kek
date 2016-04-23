import './pad.css';

// blocks

var nippleWrap = document.querySelector('.pad__nipple-wrap');
var nipple = document.querySelector('.pad__nipple');
var btn = document.querySelector('.pad__btn');
var nippleSide;
var r;
var touched;


// nipple

function posToCoords({x: x, y: y}) {

}

function coordsToPos({x: x, y: y}) {
  return {
    x: r + (r * x),
    y: r + (r * y)
  };
}

function pos({x: x, y: y}) {
  nipple.style.top = x + 'px';
  nipple.style.left = y + 'px';
}


//


// resize

function resize() {
  nippleWrap.style.width = nippleWrap.getBoundingClientRect().height + 'px';
  nippleWrap.style.left = nippleWrap.getBoundingClientRect().top + 'px';
  btn.style.width = btn.getBoundingClientRect().height + 'px';
  btn.style.right = btn.getBoundingClientRect().top + 'px';
  nippleSide = nipple.getBoundingClientRect().width;
  r = nippleWrap.getBoundingClientRect().width / 2;
  nipple.style.marginLeft = nipple.style.marginTop = (- nippleSide / 2) + 'px';
  if (!touched) {
    pos(coordsToPos({x: 0, y: 0}));
  }
};

resize();
window.onresize = resize;
