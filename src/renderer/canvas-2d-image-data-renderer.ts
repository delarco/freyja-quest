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

    drawHorizontalLine(x1: number, x2: number, y: number, color: Color): void {

        for(let x = x1; x <= x2; x++) {

            this.drawPixel(x, y, color);
        }
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

    drawTexture(x: number, y: number, texture: Texture, scale: number = 1): void {

        for (let ty of ArrayUtils.range(texture.size.height)) {

            for (let tx of ArrayUtils.range(texture.size.width)) {

                const dx = x + tx * scale;
                const dy = y + ty * scale;

                const color = texture.getPixelColor(tx, ty);

                if (color.a == 0) continue;

                for (let yOff = 0; yOff < Math.ceil(scale); yOff++) {

                    const ddy = Math.floor(dy) + yOff;
 
                    for (let xOff = 0; xOff < Math.ceil(scale); xOff++) {

                        const ddx = Math.floor(dx) + xOff;
                        
                        if(ddx < 0 || ddx>= this.resolution.width) continue;
                        
                        this.drawPixel(ddx, ddy, color)
                    }
                }
            }
        }
    }

    swapBuffer(): void {

        this.context!.putImageData(this.imageData!, 0, 0);
    }
}
