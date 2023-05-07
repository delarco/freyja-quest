import { Color } from "./color";
import { Size } from "./size";

export class Texture {

    constructor(
        public name: string,
        public size: Size = new Size(0, 0),
        public data: Array<Color> = []
    ) { }

    public drawPixel(x: number, y: number, color: Color): void {

        let index = (y * this.size.width + x);
        this.data[index] = color;
    }

    public getPixelColor(x: number, y: number): Color {

        return this.data[y * this.size.width + x];
    }
}
