'use strict';

let ID = 0;

class Circle {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;

    this.dx = 0;
    this.dy = 0;

    this.id = id === undefined ? ID ++ : id;
    console.log('create: ', this.id, id)

    this.speed = 300;

    this.invalid = true;
  }

  setD(dx, dy) {
    if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
      this.dx = dx;
      this.dy = dy;
    }

    this.invalid = true;
  }

  setValid() {
    this.invalid = false;
  }

  update(dtTime) {
    const dx = this.dx * dtTime * this.speed / 1000;
    const dy = this.dy * dtTime * this.speed / 1000;

    this.x += dx;
    this.y += dy;
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      a: this.dx,
      b: this.dy,
      i: this.id,
    }
  }

  render(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.arc(this.x, this.y, 50, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }
}

module.exports = Circle;
