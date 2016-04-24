const B = '#333';
const S = '#FFDFC4';
const R = '#e33';
const W = '#fff';
let C = 'brand';

const frames = {

  'down': [
    [ 0, 0, 0, C, C, C, C, C, 0, 0, 0, 0 ],
    [ 0, 0, 0, C, C, C, C, C, 0, 0, W, 0 ],
    [ 0, 0, 0, C, C, C, C, C, 0, 0, W, 0 ],
    [ 0, 0, 0, S, B, S, B, S, 0, 0, W, 0 ],
    [ 0, 0, 0, R, R, R, R, R, 0, W, W, W ],
    [ 0, C, C, C, R, R, R, C, C, C, C, 0 ],
    [ 0, C, 0, C, C, R, C, C, 0, 0, W, 0 ],
    [ 0, C, 0, C, C, C, C, C, 0, 0, 0, 0 ],
    [ 0, C, 0, C, C, C, C, C, 0, 0, 0, 0 ],
    [ 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0, 0 ],
    [ 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0, 0 ],
    [ 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0, 0 ],
  ],

  'up': [
    [ 0, 0, 0, 0, C, C, C, C, C, 0, 0, 0 ],
    [ 0, W, 0, 0, C, C, C, C, C, 0, 0, 0 ],
    [ 0, W, 0, 0, C, C, C, C, C, 0, 0, 0 ],
    [ 0, W, 0, 0, S, S, S, S, S, 0, 0, 0 ],
    [ W, W, W, 0, R, R, R, R, R, 0, 0, 0 ],
    [ 0, C, C, C, C, C, C, C, C, C, C, 0 ],
    [ 0, W, 0, 0, C, C, C, C, C, 0, C, 0 ],
    [ 0, 0, 0, 0, C, C, C, C, C, 0, C, 0 ],
    [ 0, 0, 0, 0, C, C, C, C, C, 0, C, 0 ],
    [ 0, 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0 ],
    [ 0, 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0 ],
    [ 0, 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0 ],
  ],

  'left': [
    [ 0, 0, 0, 0, C, C, C, C, C, 0, 0, 0 ],
    [ 0, W, 0, 0, C, C, C, C, C, 0, 0, 0 ],
    [ 0, W, 0, 0, C, C, C, C, C, 0, 0, 0 ],
    [ 0, W, 0, 0, S, B, S, S, S, 0, 0, 0 ],
    [ W, W, W, 0, R, R, R, R, R, 0, 0, 0 ],
    [ 0, C, C, C, R, R, C, C, C, C, C, 0 ],
    [ 0, W, 0, 0, R, C, C, C, C, 0, C, 0 ],
    [ 0, 0, 0, 0, C, C, C, C, C, 0, C, 0 ],
    [ 0, 0, 0, 0, C, C, C, C, C, 0, C, 0 ],
    [ 0, 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0 ],
    [ 0, 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0 ],
    [ 0, 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0 ],
  ],

  'right': [
    [ 0, 0, 0, C, C, C, C, C, 0, 0, 0, 0 ],
    [ 0, 0, 0, C, C, C, C, C, 0, 0, W, 0 ],
    [ 0, 0, 0, C, C, C, C, C, 0, 0, W, 0 ],
    [ 0, 0, 0, S, S, S, B, S, 0, 0, W, 0 ],
    [ 0, 0, 0, R, R, R, R, R, 0, W, W, W ],
    [ 0, C, C, C, C, C, R, R, C, C, C, 0 ],
    [ 0, C, 0, C, C, C, C, R, 0, 0, W, 0 ],
    [ 0, C, 0, C, C, C, C, C, 0, 0, 0, 0 ],
    [ 0, C, 0, C, C, C, C, C, 0, 0, 0, 0 ],
    [ 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0, 0 ],
    [ 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0, 0 ],
    [ 0, 0, 0, C, 0, 0, 0, C, 0, 0, 0, 0 ],
  ],

}

export default frames;