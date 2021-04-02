import { COLORS, COLORSDARKER, COLORSLIGHTER, SHAPES } from './constants';
import { GraphicsService } from './graphics.service';

export interface IPiece {
  x: number;
  y: number;
  color: string;
  colorLighter: string;
  colorDarker: string;
  shape: number[][];
}

export class Piece implements IPiece {
  x: number = 0;
  y: number = 0;
  colorLighter: string = 'nothing';
  colorDarker: string = 'nothing';
  color: string = 'nothing';
  shape: number[][] = [];

  constructor(
    private ctx: CanvasRenderingContext2D,
    private ctxNext: CanvasRenderingContext2D = null,
    private graphicsService: GraphicsService
  ) {
    this.spawn();
  }
  private spawn() {
    const typeId = this.randomizeTetrominoType(COLORS.length - 1);
    this.color = COLORS[typeId];
    this.shape = SHAPES[typeId];
    this.colorLighter = COLORSLIGHTER[typeId];
    this.colorDarker = COLORSDARKER[typeId];
    this.x = 3;
    this.y = 0;
  }

  draw() {
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillStyle = this.color;
          const currentX = this.x + x;
          const currentY = this.y + y;
          this.ctx.fillRect(currentX, currentY, 1, 1);
          this.graphicsService.add3D(
            this.ctx,
            currentX,
            currentY,
            this.colorDarker,
            this.colorLighter
          );
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
          this.graphicsService.addNextShadow(this.ctxNext, x, y);
          this.ctxNext.fillStyle = this.color;
          this.ctxNext.fillRect(x, y, 1, 1);

          this.graphicsService.add3D(
            this.ctxNext,
            x,
            y,
            this.colorDarker,
            this.colorLighter
          );
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
