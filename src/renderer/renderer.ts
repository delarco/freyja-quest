import { Color } from "../models/color";

export interface IRenderer {

    clear(color: Color): void;

    drawLine(x1: number, y1: number, x2: number, y2: number, lineWidth: number, color: Color): void;

    drawRect(x: number, y: number, w: number, h: number, color: Color): void;

    drawCircle(x: number, y: number, radius: number, borderColor: Color, fillColor: Color): void;

    drawPixel(x: number, y: number, color: Color): void;
}
