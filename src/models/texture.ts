import { Color } from "./color";
import { Size } from "./size";

export class Texture {

    public static readonly EMPTY: Texture = new Texture(
        'empty', new Size(32, 32), [...new Array(32 * 32).keys()].map(() => new Color())
    );

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
