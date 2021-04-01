import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BoardService } from '../board.service';
import {
  BLOCK_SIZE,
  COLORS,
  COLS,
  GAME_STATES,
  KEY,
  LEVEL,
  LINES_PER_LEVEL,
  POINTS,
  ROWS,
} from '../constants';
import { IPiece, Piece } from '../piece.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.moves[event.keyCode]) {
      event.preventDefault();

      let newPieceState = this.moves[event.keyCode](this.piece);
      if (event.keyCode === KEY.SPACE) {
        while (this.boardService.valid(newPieceState, this.board)) {
          this.points += POINTS.HARD_DROP;
          this.piece.move(newPieceState);
          newPieceState = this.moves[KEY.DOWN](this.piece);
        }
      }

      if (event.keyCode === KEY.DOWN) {
        this.points += POINTS.SOFT_DROP;
      }

      if (this.boardService.valid(newPieceState, this.board)) {
        this.piece?.move(newPieceState);
      }

      this.animate();
    }
  }
  @ViewChild('board', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('next', { static: true })
  canvasNext: ElementRef<HTMLCanvasElement>;

  ctx: CanvasRenderingContext2D;
  ctxNext: CanvasRenderingContext2D;
  points: number = 0;
  lines: number = 0;
  level: number = 0;
  board: number[][] = [];
  piece: Piece;
  next: Piece;
  time = { start: 0, elapsed: 0, level: 1000 };
  requestId: number = 0;
  gameState: string = GAME_STATES.PAUSED;

  /* OBJECT LITERALS!
  Eksempel KEY.LEFT
  1. Assign knappen (left) til et piece 
  2. brug spread operator (...) til at lave en shallow copy (fordi det kun er tal) og assign den nye en værdi med x -1 ifh til før 
  3. Når man trykker på knappen, opretter man et nyt objekt som er -1 mod venstre. Sletter det gamle canvas og tegner et nyt, med det objekt på*/
  moves = {
    [KEY.LEFT]: (p: IPiece): IPiece => ({ ...p, x: p.x - 1 }),
    [KEY.RIGHT]: (p: IPiece): IPiece => ({ ...p, x: p.x + 1 }),
    [KEY.DOWN]: (p: IPiece): IPiece => ({ ...p, y: p.y + 1 }),
    [KEY.SPACE]: (p: IPiece): IPiece => ({ ...p, y: p.y + 1 }),
    [KEY.UP]: (p: Piece): IPiece => p.rotate(p),
  };

  constructor(private boardService: BoardService) {}

  ngOnInit() {
    this.initBoard();
    this.initNext();
    console.log(this.moves);
  }

  private initBoard() {
    this.resetGame();
    this.ctx = this.canvas?.nativeElement.getContext('2d');
    this.ctx.canvas.width = COLS * BLOCK_SIZE;
    this.ctx.canvas.height = ROWS * BLOCK_SIZE;

    this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
  }

  private initNext() {
    this.ctxNext = this.canvasNext.nativeElement.getContext('2d');

    this.ctxNext.canvas.width = 8 * BLOCK_SIZE;
    this.ctxNext.canvas.height = 8 * BLOCK_SIZE;

    this.ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
  }

  onPlay() {
    this.resetGame();
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.board = this.boardService.getEmptyBoard();
    this.newPiece();
    this.gameState = GAME_STATES.PLAYING;
  }

  private animate(now = 0) {
    this.ctx?.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.time.elapsed = now - this.time.start;
    if (this.time.elapsed > this.time.level) {
      this.time.start = now;
      this.dropPiece();
    }

    if (this.gameState === GAME_STATES.GAMEOVER) {
      this.gameOver();
      return;
    }

    this.piece.draw();
    this.drawBoard();
    this.requestId = requestAnimationFrame(this.animate.bind(this));
  }

  private newPiece() {
    this.next = new Piece(this.ctx, this.ctxNext);
    this.next.drawNext();

    this.piece = this.next;
    // console.table(this.board);
    this.animate();
  }

  private dropPiece() {
    let p = this.moves[KEY.DOWN](this.piece);
    if (this.boardService.valid(p, this.board)) {
      this.piece.move(p);
    } else {
      this.freezePiece();
      this.clearLines();
      this.isGameOver();
      this.newPiece();
    }
  }

  private isGameOver() {
    console.log('her');

    this.gameState =
      this.piece.y === 0 ? GAME_STATES.GAMEOVER : GAME_STATES.PLAYING;
  }

  private freezePiece() {
    this.piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.board[y + this.piece.y][x + this.piece.x] = value;
        }
      });
    });
  }

  private drawBoard() {
    this.board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillStyle = COLORS[value];
          this.ctx.fillRect(x, y, 1, 1);
        }
      });
    });
  }

  private clearLines() {
    let lines = 0;
    this.board.forEach((row, y) => {
      if (row.every((value) => value > 0)) {
        lines++;
        this.board.splice(y, 1);
        this.board.unshift(Array(COLS).fill(0));
      }
    });

    if (lines > 0) {
      this.lines += lines;
      this.points += this.boardService.getLineClearPoints(lines, this.level);
      this.checkSetLevel();
    }
  }

  private gameOver() {
    console.log(this.requestId);

    cancelAnimationFrame(this.requestId);
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(1, 3, 8, 1.2);
    this.ctx.font = '1px arial';
    this.ctx.fillStyle = 'red';
    this.ctx.fillText('GAME OVER!', 1.8, 4);
  }

  private resetGame() {
    this.points = 0;
    this.lines = 0;
    this.level = 0;
    this.board = this.boardService.getEmptyBoard();
  }

  private checkSetLevel() {
    if (this.lines >= LINES_PER_LEVEL) {
      this.level++;
      this.lines -= LINES_PER_LEVEL;
      this.time.level = LEVEL[this.level];
    }
  }
}
