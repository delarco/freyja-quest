export interface IRenderer {

    clear(color: string): void;

    drawLine(x1: number, y1: number, x2: number, y2: number, lineWidth: number, color: string): void;
}