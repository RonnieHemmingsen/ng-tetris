import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GraphicsService {
  constructor() {}

  addNextShadow(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#232323';
    ctx.fillRect(x, y, 1.025, 1.025);
  }

  add3D(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    darker: string,
    lighter: string
  ): void {
    //Set neon blur
    ctx.shadowColor = darker;
    ctx.shadowBlur = 10;

    // Vertical
    ctx.fillRect(x + 0.9, y, 0.1, 1);
    // Horizontal
    ctx.fillRect(x, y + 0.9, 1, 0.1);

    //Darker Color - Inner
    // Vertical
    // ctx.fillRect(x + 0.65, y + 0.3, 0.05, 0.3);
    // // Horizontal
    // ctx.fillRect(x + 0.3, y + 0.6, 0.4, 0.05);

    // Lighter Color - Outer
    ctx.fillStyle = lighter;

    // Lighter Color - Inner
    // Vertical
    // ctx.fillRect(x + 0.3, y + 0.3, 0.05, 0.3);
    // // Horizontal
    // ctx.fillRect(x + 0.3, y + 0.3, 0.4, 0.05);

    // Lighter Color - Outer
    // Vertical;
    ctx.fillRect(x, y, 0.05, 1);
    ctx.fillRect(x, y, 0.1, 0.95);
    // Horizontal
    ctx.fillRect(x, y, 1, 0.05);
    ctx.fillRect(x, y, 0.95, 0.1);
  }
}
