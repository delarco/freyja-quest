import { Color } from "../models/color";
import { Size } from "../models/size";
import { IRenderer } from "./renderer";

export class Canvas2DRenderer implements IRenderer {

    private context: CanvasRenderingContext2D | null;

    constructor(private canvas: HTMLCanvasElement, private resolution: Size, private screen: Size) {

        this.context = this.canvas.getContext("2d");
        if (!this.context) throw new Error('Could not get context.');

        this.canvas.width = resolution.width;
        this.canvas.height = resolution.height;
        this.canvas.style.width = `${screen.width}px`;
        this.canvas.style.width = `${screen.height}px`;
    }

    clear(color: Color): void {

        if (!this.context) return;

        this.context.fillStyle = color.RGB;
        this.context.fillRect(0, 0, this.resolution.width, this.resolution.height);
    }

    drawLine(x1: number, y1: number, x2: number, y2: number, lineWidth: number, color: Color): void {

        if (!this.context) return;

        this.context.strokeStyle = color.RGB;
        this.context.beginPath();
        this.context.lineWidth = lineWidth;
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
        this.context.closePath();
    }

    drawRect(x: number, y: number, w: number, h: number, color: Color): void {

        if (!this.context) return;

        this.context.fillStyle = color.RGB;
        this.context.fillRect(x, y, w, h);
    }

    drawCircle(x: number, y: number, radius: number, borderColor: Color, fillColor: Color): void {

        if (!this.context) return;

        this.context.strokeStyle = borderColor.RGBA;
        this.context.fillStyle = fillColor.RGBA;
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, 2 * Math.PI);
        this.context.stroke();
        this.context.fill();
        this.context.closePath();
    }

    drawPixel(x: number, y: number, color: Color): void {

        this.drawRect(x, y, 1, 1, color);
    }
}
