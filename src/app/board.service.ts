import { Injectable } from '@angular/core';
import { COLS, POINTS, ROWS } from './constants';
import { IPiece } from './piece.component';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  constructor() {}

  getEmptyBoard(): number[][] {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }

  valid(p: IPiece, board: number[][]): boolean {
    return p.shape.every((row, dy) => {
      return row.every((value, dx) => {
        let x = p.x + dx;
        let y = p.y + dy;
        return (
          this.isEmpty(value) ||
          (this.isInsideWalls(x) &&
            this.isAboveFloor(y) &&
            this.isSpaceAvailable(board, x, y))
        );
      });
    });
  }

  isEmpty(value: number): boolean {
    return value === 0;
  }

  isInsideWalls(x: number): boolean {
    return x >= 0 && x < COLS;
  }

  isAboveFloor(y: number): boolean {
    return y < ROWS;
  }

  isSpaceAvailable(board: number[][], x: number, y: number): boolean {
    return board[y] && board[y][x] === 0;
  }

  getLineClearPoints(lines: number, level): number {
    const points =
      lines === 1
        ? POINTS.SINGLE
        : lines === 2
        ? POINTS.DOUBLE
        : lines === 3
        ? POINTS.TRIPLE
        : lines === 4
        ? POINTS.TETRIS
        : 0;

    return (level + 1) * points;
  }
}
