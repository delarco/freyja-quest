import { AssetsManager } from "../assets-manager";
import { Debugger } from "../debugger";
import { Color } from "../models/color";
import { Ray } from "../models/ray";
import { Size } from "../models/size";
import { Texture } from "../models/texture";
import { ArrayUtils } from "../utils/array-utils";
import { IRenderer } from "./renderer";

export class Canvas2DImageDataRenderer implements IRenderer {

    private context: CanvasRenderingContext2D | null;
    private imageData: ImageData | null = null;
    public buffer: Uint8ClampedArray | null = null;

    private textCanvas: HTMLCanvasElement;
    private textContext: CanvasRenderingContext2D;

    constructor(private canvas: HTMLCanvasElement, private resolution: Size, private screen: Size) {

        this.context = this.canvas.getContext("2d");
        if (!this.context) throw new Error('Could not get context.');

        this.canvas.width = resolution.width;
        this.canvas.height = resolution.height;
        this.canvas.style.width = `${this.screen.width}px`;
        this.canvas.style.height = `${this.screen.height}px`;

        this.imageData = this.context.getImageData(0, 0, resolution.width, resolution.height);
        this.buffer = this.imageData.data;

        this.textCanvas = document.createElement("canvas")!;
        this.textCanvas.width = resolution.width;
        this.textCanvas.height = resolution.height;
        this.textContext = this.textCanvas.getContext("2d", { willReadFrequently: true })!;
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

        for (let x = x1; x <= x2; x++) {

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

        if (color.a == 0) return;

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

                        if (ddx < 0 || ddx >= this.resolution.width) continue;

                        this.drawPixel(ddx, ddy, color)
                    }
                }
            }
        }
    }

    drawSprite(x: number, y: number, texture: Texture, distance: number, rays: Ray[], scale: number = 1): void {

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

                        if (ddx < 0 || ddx >= this.resolution.width) continue;

                        const ray = rays[ddx];
                        
                        if(ray && ray.size < distance) continue;

                        this.drawPixel(ddx, ddy, color)
                    }
                }
            }
        }
    }

    drawText(text: string, x: number, y: number, fontSize: number, color: Color, bold: boolean = false, borderWidth: number | null = null, borderColor: Color | null = null): void {

        this.textContext!.clearRect(0, 0, this.resolution.width, this.resolution.height);

        this.textContext!.fillStyle = color.RGB;
        this.textContext!.font = `${bold ? 'bold' : ''} ${fontSize}px Arial`;

        const metrics = this.textContext.measureText(text);
        this.textContext!.fillText(text, metrics.actualBoundingBoxLeft, metrics.actualBoundingBoxAscent);

        if (borderWidth && borderColor) {
            this.textContext!.lineWidth = borderWidth;
            this.textContext!.strokeStyle = borderColor.RGB;
            this.textContext!.strokeText(text, metrics.actualBoundingBoxLeft, metrics.actualBoundingBoxAscent);
        }

        const textImageData = this.textContext.getImageData(
            0, 0,
            Math.ceil(metrics.width),
            metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
        );

        const textBuffer = textImageData.data;

        for (let ty of ArrayUtils.range(textImageData.height)) {

            for (let tx of ArrayUtils.range(textImageData.width)) {

                const offset = 4 * ((ty + y) * this.resolution.width + tx + x);
                const textOffset = 4 * (ty * textImageData.width + tx);

                if (textBuffer[textOffset + 3] < 150) continue;

                this.buffer![offset + 0] = textBuffer[textOffset + 0];
                this.buffer![offset + 1] = textBuffer[textOffset + 1];
                this.buffer![offset + 2] = textBuffer[textOffset + 2];
                this.buffer![offset + 3] = textBuffer[textOffset + 3];
            }
        }
    }

    swapBuffer(): void {

        this.context!.putImageData(this.imageData!, 0, 0);
    }
}
