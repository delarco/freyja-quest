import { Color } from "./models/color";
import { Map } from "./models/map";
import { Point } from "./models/point";
import { Size } from "./models/size";
import { Texture } from "./models/texture";
import { Tile } from "./models/tile";
import { ArrayUtils } from "./utils/array-utils";
import { TextureUtils } from "./utils/texture-utils";

export class AssetsManager {

    private static _instance: AssetsManager;
    public static readonly textures: Array<Texture> = [];
    public static maps: Array<Map> = [];

    public static get Instance() {

        return this._instance || (this._instance = new AssetsManager());
    }

    public async initialize() {

        // generate memory test textures
        AssetsManager.makeTestTexture('mem-test-32x32', new Size(32, 32));

        // load some textures
        await AssetsManager.loadTexture('bricks.tex');
        await AssetsManager.loadTexture('rocks.tex');
        await AssetsManager.loadTexture('rocks-sand.tex');
    }

    /**
     * Returns a texture by it's name.
     * @param name Texture name
     */
    public static getTexture(name: string): Texture | null {

        return this.textures.find(texture => texture.name == name) || null;
    }

    /**
     * Generates and returns a test texture.
     */
    private static makeTestTexture(name: string, size: Size): Texture {

        const texture = new Texture(name, size, new Array<Color>());

        for (let y of ArrayUtils.range(size.height)) {

            for (let x of ArrayUtils.range(size.width)) {

                let color = new Color(255, 255, 255);

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
                ) color = Color.BLACK;

                texture.data.push(color);
            }
        }

        AssetsManager.textures.push(texture);
        return texture;
    }

    /**
     * Generates and returns a gradient skybox.
     * @param height 
     * @param debugBorders 
     * @returns bricks
     */
    public static makeSkyBoxTexture(height: number, debugBorders: boolean = false): Texture {

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

        AssetsManager.textures.push(texture);
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

        AssetsManager.textures.push(texture);
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

        AssetsManager.textures.push(texture);
        return texture;
    }

    /**
     * Load texture file from assets.
     * @param filename 
     * @returns 
     */
    public static async loadTexture(filename: string): Promise<Texture> {

        return new Promise(
            (resolve, reject) => {

                fetch(`assets/textures/${filename}`)
                    .then(result => result.arrayBuffer())
                    .then((buffer: ArrayBuffer) => {

                        const data = new Uint8Array(buffer);
                        const texture = TextureUtils.deserialize(data);
                        
                        AssetsManager.textures.push(texture);
                        return resolve(texture);
                    })
                    .catch(() => {
                        alert(`Error loading texture: ${filename}.`);
                        reject();
                    });
            }
        );
    }

    /**
     * Returns a map by it's name.
     * @param name Map name
     */
    public static getMap(name: string): Map | null {

        return this.maps.find(map => map.name == name) || null;
    }

    /**
     * Create a test map surrounded by walls.
     * @param width 
     * @param height 
     * @param tileSize 
     * @returns 
     */
    public static createTestMap(width: number, height: number, tileSize: number): Map {

        const map = new Map('Test Map', width, height, tileSize);
        const floorTexture = AssetsManager.getTexture('rocks') || Texture.EMPTY;
        const wallTexture1 = AssetsManager.getTexture('bricks') || Texture.EMPTY;
        const wallTexture2 = AssetsManager.getTexture('rocks-sand') || Texture.EMPTY;

        for (let y of ArrayUtils.range(map.size.height)) {
            for (let x of ArrayUtils.range(map.size.width)) {

                const tile = new Tile();

                const isWall = (
                    x == 0
                    || y == 0
                    || (x == map.size.width - 1 && y < 4)
                    || (x == map.size.width - 1 && y > 6)
                    || (y == map.size.height - 1)
                    || (x == 1 && y == 1)
                    || (x == 4 && y > 3 && y < 15)
                    || (x == 16 && y > 8 && y < 15)
                    || (x > 5 && x < 15 && y == 12)
                    || (x >= 16 && x <= 17 && y >= 2 && y <= 3)
                    || (x >= 10 && x <= 11 && y >= 5 && y <= 6)
                )

                tile.minimapColor = isWall
                    ? new Color(170, 170, 170)
                    : new Color(240, 240, 240);

                if (
                    (x >= 16 && x <= 17 && y >= 2 && y <= 3)
                    || (x >= 10 && x <= 11 && y >= 5 && y <= 6)
                ) tile.minimapColor = new Color(221, 170, 170);

                if (x > 5 && x < 15 && y == 12) tile.minimapColor = new Color(170, 221, 170);

                if (x == 4 && y > 3 && y < 15) tile.minimapColor = new Color(170, 170, 221);

                if (x == 16 && y > 8 && y < 15) tile.minimapColor = new Color(221, 221, 170);

                tile.collision = isWall;
                tile.index = new Point(x, y);
                tile.position = new Point(x * tileSize, y * tileSize);
                tile.floor = floorTexture;
                tile.wall = wallTexture1;

                if (x == 1 && y == 1) tile.wall = wallTexture2;

                if (x % 2 == y % 2) tile.floor = floorTexture!;

                map.tiles[y * map.size.width + x] = tile;
            }
        }

        return map;
    }
}
