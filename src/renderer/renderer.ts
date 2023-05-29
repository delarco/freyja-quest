import { Color } from "../models/color";
import { Ray } from "../models/ray";
import { Texture } from "../models/texture";

export interface IRenderer {

    clear(color: Color): void;

    drawLine(x1: number, y1: number, x2: number, y2: number, lineWidth: number, color: Color): void;

    drawHorizontalLine(x1: number, x2: number, y: number, color: Color): void;

    drawRect(x: number, y: number, w: number, h: number, color: Color): void;

    drawCircle(x: number, y: number, radius: number, borderColor: Color, fillColor: Color): void;

    drawPixel(x: number, y: number, color: Color): void;

    drawTexture(x: number, y: number, texture: Texture, scale?: number): void;

    drawSprite(x: number, y: number, texture: Texture, distance: number, rays: Ray[], scale?: number): void;

    drawText(text: string, x: number, y: number, fontSize: number, color: Color, bold?: boolean, borderWidth?: number | null, borderColor?: Color | null): void;

    swapBuffer(): void;
}
