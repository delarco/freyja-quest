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

    clear(color: string): void {
        
        if (!this.context) return;

        this.context.fillStyle = color;
        this.context.fillRect(0, 0, this.resolution.width, this.resolution.height);
    }

    drawLine(x1: number, y1: number, x2: number, y2: number, lineWidth: number, color: string): void {
        
        if (!this.context) return;

        this.context.strokeStyle = color;
        this.context.beginPath();
        this.context.lineWidth = lineWidth;
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
        this.context.closePath();
    }
}