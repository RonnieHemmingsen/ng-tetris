import { COLORS, SHAPES } from './constants';

export interface IPiece {
  x: number;
  y: number;
  color: string;
  shape: number[][];
}

export class Piece implements IPiece {
  x: number = 0;
  y: number = 0;
  color: string = 'nothing';
  shape: number[][] = [];

  constructor(
    private ctx: CanvasRenderingContext2D,
    private ctxNext: CanvasRenderingContext2D = null
  ) {
    this.spawn();
  }
  private spawn() {
    const typeId = this.randomizeTetrominoType(COLORS.length - 1);
    this.color = COLORS[typeId];
    this.shape = SHAPES[typeId];

    this.x = 3;
    this.y = 0;
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillRect(this.x + x, this.y + y, 1, 1);
        }
      });
    });
  }

  drawNext() {
    if (this.ctxNext === null || this.ctxNext === undefined) {
      return;
    }

    this.ctxNext.clearRect(
      0,
      0,
      this.ctxNext.canvas.width,
      this.ctxNext.canvas.height
    );

    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctxNext.fillStyle = this.color;
          this.ctxNext.fillRect(x, y, 1, 1);
        }
      });
    });
  }

  move(p: IPiece) {
    this.x = p.x;
    this.y = p.y;
    this.shape = p.shape;
  }

  rotate(p: IPiece) {
    let clone: IPiece = JSON.parse(JSON.stringify(p));

    for (let y = 0; y < clone.shape.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [clone.shape[x][y], clone.shape[y][x]] = [
          clone.shape[y][x],
          clone.shape[x][y],
        ];
      }
    }
    clone.shape.forEach((row) => row.reverse());
    return clone;
  }

  private randomizeTetrominoType(noOfTypes: number): number {
    return Math.floor(Math.random() * noOfTypes + 1);
  }
}
