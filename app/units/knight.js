
const B = '#333';
const G = '#666';
const W = '#fff';
let C = 'brand';

const frames = {

  'down': [
    [ 0, 0, 0, W, W, W, W, W, 0, 0, W, 0 ],
    [ 0, 0, 0, W, W, W, W, W, 0, 0, W, 0 ],
    [ 0, 0, 0, W, B, B, B, W, 0, 0, W, 0 ],
    [ 0, 0, 0, W, W, B, W, W, 0, 0, W, 0 ],
    [ 0, 0, 0, W, W, B, W, W, 0, W, W, W ],
    [ G, G, G, G, C, C, C, C, C, C, C, 0 ],
    [ G, G, G, G, C, C, C, C, 0, 0, W, 0 ],
    [ G, G, G, G, C, C, C, C, 0, 0, 0, 0 ],
    [ G, G, G, G, C, C, C, C, 0, 0, 0, 0 ],
    [ 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0, 0 ],
    [ 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0, 0 ],
    [ 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0, 0 ],
  ],

  'up': [
    [ 0, W, 0, 0, W, W, W, W, W, 0, 0, 0 ],
    [ 0, W, 0, 0, W, W, W, W, W, 0, 0, 0 ],
    [ 0, W, 0, 0, W, W, W, W, W, 0, 0, 0 ],
    [ 0, W, 0, 0, W, W, W, W, W, 0, 0, 0 ],
    [ W, W, W, 0, W, W, W, W, W, 0, 0, 0 ],
    [ 0, C, C, C, C, C, C, C, C, G, G, G ],
    [ 0, W, 0, 0, C, C, C, C, C, G, G, G ],
    [ 0, 0, 0, 0, C, C, C, C, C, G, G, G ],
    [ 0, 0, 0, 0, C, C, C, C, C, G, G, G ],
    [ 0, 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0 ],
    [ 0, 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0 ],
    [ 0, 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0 ],
  ],

  'left': [
    [ 0, W, 0, 0, W, W, W, W, W, 0, 0, 0 ],
    [ 0, W, 0, 0, W, W, W, W, W, 0, 0, 0 ],
    [ 0, W, 0, 0, B, B, W, W, W, 0, 0, 0 ],
    [ 0, W, 0, 0, B, W, W, W, W, 0, 0, 0 ],
    [ W, W, W, 0, B, W, W, W, W, 0, 0, 0 ],
    [ 0, C, C, C, C, C, C, C, G, G, G, G ],
    [ 0, W, 0, 0, C, C, C, C, G, G, G, G ],
    [ 0, 0, 0, 0, C, C, C, C, G, G, G, G ],
    [ 0, 0, 0, 0, C, C, C, C, G, G, G, G ],
    [ 0, 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0 ],
    [ 0, 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0 ],
    [ 0, 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0 ],
  ],

  'right': [
    [ 0, 0, 0, W, W, W, W, W, 0, 0, W, 0 ],
    [ 0, 0, 0, W, W, W, W, W, 0, 0, W, 0 ],
    [ 0, 0, 0, W, W, W, B, B, 0, 0, W, 0 ],
    [ 0, 0, 0, W, W, W, W, B, 0, 0, W, 0 ],
    [ 0, 0, 0, W, W, W, W, B, 0, W, W, W ],
    [ G, G, G, C, C, C, C, C, C, C, C, 0 ],
    [ G, G, G, C, C, C, C, C, 0, 0, W, 0 ],
    [ G, G, G, C, C, C, C, C, 0, 0, 0, 0 ],
    [ G, G, G, C, C, C, C, C, 0, 0, 0, 0 ],
    [ 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0, 0 ],
    [ 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0, 0 ],
    [ 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0, 0 ],
  ],


}

function drawPixel(a, x, y) {
  // _ctx.fillStyle = color
  // _ctx.fillRect x, y, a, a
}

export default function knight(ctx, x, y, r, c, dir) {
  const a = Math.ceil(r * 1.25 * Math.SQRT2 / 12);
  const offset = a * 6;

  ctx.save();
  ctx.translate(Math.ceil(x) - offset, Math.ceil(y) - offset);
  for (let i = 0; i < frames[dir].length; i ++) {
    for (let j = 0; j < frames[dir][i].length; j ++) {
      if (frames[dir][i][j] === 0) continue;
      ctx.fillStyle = frames[dir][i][j] === 'brand' ? c : frames[dir][i][j];
      ctx.fillRect(j * a, i * a, a, a);
    }
  }
  ctx.restore();
}