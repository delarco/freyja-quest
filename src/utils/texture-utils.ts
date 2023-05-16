import { Color } from "../models/color";
import { Size } from "../models/size";
import { Texture } from "../models/texture";
import { ArrayUtils } from "./array-utils";

export class TextureUtils {

    /**
     * Serialize a texture into TEX format
     * @param texture 
     * @returns 
     */
    public static serialize(texture: Texture): Uint8Array {

        // 30 bytes: name
        // 1 byte: width
        // 1 byte: height
        // N bytes: data * 4 (pixel RGBA)
        const size = 30 + 1 + 1 + (texture.size.width * texture.size.height * 4);
        const data = new Uint8Array(size);

        for(let i = 0; i < texture.name.length; i++) data[i] = texture.name.charCodeAt(i);

        data[30] = texture.size.width;
        data[31] = texture.size.height;

        let offset = 32;

        for(let color of texture.data) {

            data[offset + 0] = color.r;
            data[offset + 1] = color.g;
            data[offset + 2] = color.b;
            data[offset + 3] = color.a;
            offset += 4;
        }
        
        return data;
    }

    /**
     * Deserialize a texture from TEX format
     * @param data 
     * @returns 
     */
    public static deserialize(data: Uint8Array): Texture {

        // 30 bytes: name
        // 1 byte: width
        // 1 byte: height
        // N bytes: data * 4 (pixel RGBA)

        let name = '';
        let width = 0;
        let height = 0;
        let arrayColors = new Array<Color>();

        for(let i = 0; i < 30; i++) {
            
            if(data[i] == 0) break;
            name += String.fromCharCode(data[i]);
        }

        width = data[30];
        height = data[31];

        const size = 30 + 1 + 1 + (width * height * 4);

        for(let index = 32; index < size; index += 4) {

            const color = new Color(
                data[index + 0],
                data[index + 1],
                data[index + 2],
                data[index + 3]
            );

            arrayColors.push(color);
        }

        return new Texture(name, new Size(width, height), arrayColors);
    }

    /**
     * Generates and returns a test texture.
     */
    private static makeTestTexture(name: string, size: Size): Texture {

        const texture = new Texture(name, size, new Array<Color>());

        for (let y of ArrayUtils.range(size.height)) {

            for (let x of ArrayUtils.range(size.width)) {

                let color = new Color(255, 255, 255, 0);

                if (x == 0 && y != 0) color = Color.RED;

                if (y == 0 && x != 0) color = Color.GREEN;

                if (x == size.width - 1 && y != 0) color = Color.BLUE;

                if (y == size.height - 1 && x != 0) color = Color.ORANGE;

                if (
                    (x == 0 && y == 0)
                    || (x == size.width - 1 && y == 0)
                    || (x == 0 && y == size.height - 1)
                    || (x == size.width - 1 && y == size.height - 1)
                    || (x == y)
                    || (x == 2 && y == 1)
                    || (x == 1 && y == 2)
                ) color = Color.RED;

                texture.data.push(color);
            }
        }

        return texture;
    }

    /**
     * Generates and returns a night gradient skybox.
     * @param height 
     * @param debugBorders 
     * @returns 
     */
    public static makeSkyBoxNightTexture(height: number, debugBorders: boolean = false): Texture {

        const texture = new Texture('skybox-night', new Size(360, height));

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


                if (
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

        if (debugBorders) texture.drawPixel(1, 1, Color.ORANGE);

        return texture;
    }

    /**
     * Generates and returns a day gradient skybox.
     * @param height 
     * @param debugBorders 
     * @returns 
     */
    public static makeSkyBoxDayTexture(height: number, debugBorders: boolean = false): Texture {

        const texture = new Texture('skybox-day', new Size(360, height));

        for (let y of ArrayUtils.range(texture.size.height)) {
            for (let x of ArrayUtils.range(texture.size.width)) {

                let color = (x < 180)
                    ? new Color(
                        255 - (x * 255 / texture.size.width),
                        255 - (x * 255 / texture.size.width),
                        (y * 255 / texture.size.height)
                    )
                    : new Color(
                        255 - ((360 - x) * 255 / texture.size.width),
                        255 - ((360 - x) * 255 / texture.size.width),
                        (y * 255 / texture.size.height)
                    )

                if (
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

        if (debugBorders) texture.drawPixel(1, 1, Color.ORANGE);

        return texture;
    }

    /**
     * Generate a bricks-like test texture
     * @param size 
     * @param fillColor 
     * @param debugBorders 
     * @returns 
     */
    public static makeBricksTexture(size: Size, fillColor: Color, debugBorders: boolean = false): Texture {

        const texture = new Texture('bricks', size);

        for (let y of ArrayUtils.range(size.height)) {

            for (let x of ArrayUtils.range(size.width)) {

                let color = (
                    y == 0
                    || (x == size.width / 2 && y < size.height / 2)
                    || (y == size.height / 2)
                    || (x == Math.trunc(size.width / 4) && y > size.height / 2)
                    || (x == Math.trunc(size.width / 4) * 3 && y > size.height / 2)
                )
                    ? new Color(99, 69, 44)
                    : fillColor//new Color(200, 140, 90)

                color = (
                    debugBorders
                    && (
                        x == 0
                        || y == 0
                        || x == size.width - 1
                        || y == size.height - 1
                    )
                )
                    ? Color.BLACK
                    : color

                texture.data.push(color)
            }
        }

        if (debugBorders) {

            texture.drawPixel(1, 1, Color.RED);
            texture.drawPixel(texture.size.width - 2, texture.size.height - 2, Color.GREEN);
        }

        return texture;
    }

    /**
     * Generate a wall test texture.
     * @param size 
     * @param fillColor 
     * @param debugBorders 
     * @returns 
     */
    public static makeWallTexture(size: Size, fillColor: Color, debugBorders: boolean = false): Texture {

        const texture = new Texture('wall', size);

        for (let y of ArrayUtils.range(size.height)) {

            for (let x of ArrayUtils.range(size.width)) {

                let color = (
                    debugBorders
                    && (
                        x == 0
                        || y == 0
                        || x == size.width - 1
                        || y == size.height - 1
                    )
                )
                    ? Color.BLACK
                    : fillColor

                texture.data.push(color);
            }
        }

        if (debugBorders) {

            texture.drawPixel(1, 1, Color.RED);
            texture.drawPixel(texture.size.width - 2, texture.size.height - 2, Color.GREEN);
        }

        return texture;
    }
}
