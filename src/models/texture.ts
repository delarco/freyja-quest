import { ArrayUtils } from "../utils/array-utils";
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

    public static makeSkyBox(): Texture {

        const texture = new Texture('skybox', new Size(360, 240));

        for (let y of ArrayUtils.range(texture.size.height)) {
            for (let x of ArrayUtils.range(texture.size.width)) {

                let color = (x < 180)
                    ? new Color(
                        x * 255 / texture.size.width,
                        0,
                        y * 255 / texture.size.height
                    )
                    : new Color(
                        ((360 - x) * 255 / texture.size.width),
                        0,
                        y * 255 / texture.size.height
                    );

                texture.drawPixel(x, y, color);
            }
        }
        
        return texture;
    }
}
