import { ArrayUtils } from "../utils/array-utils";
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

    public static makeSkyBox(height: number, debugBorders: boolean = false): Texture {

        const texture = new Texture('skybox', new Size(360, height));

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

                
                if(
                    debugBorders && (
                        x == 0 
                        || y == 0
                        || x == texture.size.width - 1
                        || y == texture.size.height - 1
                    )
                ) color = Color.RED;

                texture.drawPixel(x, y, color);
            }
        }
        
        if(debugBorders) texture.drawPixel(1, 1, Color.ORANGE);

        return texture;
    }

    public static makeTest(size: Size, fill: Color) {

        const texture = new Texture('floor', size);

        for(let y of ArrayUtils.range(texture.size.height)) {
            for(let x of ArrayUtils.range(texture.size.width)) {

                if(
                    (x == 0 || y == 0)
                    || (x == texture.size.width - 1)
                    || (y == texture.size.height - 1)
                    || (x == 1 && y == 1)
                )
                {
                    texture.drawPixel(x, y, Color.RED);
                }
                else{
                    texture.drawPixel(x, y, fill)

                }
            }
        }

       return texture;
    }
}
