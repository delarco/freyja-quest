import { Color } from "../models/color";
import { Size } from "../models/size";
import { Texture } from "../models/texture";
import { ArrayUtils } from "../utils/array-utils";
import { IRenderer } from "./renderer";

export class Canvas2DImageDataRenderer implements IRenderer {

    private context: CanvasRenderingContext2D | null;
    private imageData: ImageData | null = null;
    public buffer: Uint8ClampedArray | null = null;

    constructor(private canvas: HTMLCanvasElement, private resolution: Size, private screen: Size) {

        this.context = this.canvas.getContext("2d");
        if (!this.context) throw new Error('Could not get context.');

        this.canvas.width = resolution.width;
        this.canvas.height = resolution.height;
        this.canvas.style.width = `${this.screen.width}px`;
        this.canvas.style.height = `${this.screen.height}px`;

        this.imageData = this.context.getImageData(0, 0, resolution.width, resolution.height);
        this.buffer = this.imageData.data;
    }

    clear(color: Color): void {

        for (let i = 0; i < this.buffer!.length; i += 4) {

            this.buffer![i + 0] = color.r;
            this.buffer![i + 1] = color.g;
            this.buffer![i + 2] = color.b;
            this.buffer![i + 3] = color.a;
        }
    }

    drawLine(x1: number, y1: number, x2: number, y2: number, lineWidth: number, color: Color): void {
        throw new Error("Method not implemented.");
    }

    drawRect(x: number, y: number, w: number, h: number, color: Color): void {

        for (let py = y; py < y + h; py++) {

            for (let px = x; px < x + w; px++) {

                this.drawPixel(px, py, color);
            }
        }
    }

    drawCircle(x: number, y: number, radius: number, borderColor: Color, fillColor: Color): void {
        throw new Error("Method not implemented.");
    }

    drawPixel(x: number, y: number, color: Color): void {

        if(color.a == 0) return;

        var index = 4 * (y * this.resolution.width + x);

        this.buffer![index + 0] = color.r;
        this.buffer![index + 1] = color.g;
        this.buffer![index + 2] = color.b;
        this.buffer![index + 3] = color.a;
    }

    drawTexture(x: number, y: number, texture: Texture): void {
        
        for(let ty of ArrayUtils.range(texture.size.height)) {

            for(let tx of ArrayUtils.range(texture.size.width)) {

                this.drawPixel(x + tx, y + ty, texture.getPixelColor(tx, ty))
            }
        }
    }

    swapBuffer(): void {

        this.context!.putImageData(this.imageData!, 0, 0);
    }
}
