import { AssetsManager } from "../assets-manager";
import { ArrayUtils } from "../utils/array-utils";
import { Color } from "./color";
import { Point } from "./point";
import { Size } from "./size";
import { Tile } from "./tile";

export class Map {

    public readonly size: Size;
    public readonly tiles: Array<Tile>;
    public readonly worldSize: Size;
    public readonly tileSize: number;

    constructor(width: number, height: number, tileSize: number) {

        this.tileSize = tileSize;
        this.size = new Size(width, height);
        this.tiles = new Array<Tile>(width * height);
        this.worldSize = new Size(width * tileSize, height * tileSize);
    }

    /**
     * Create a test map surrounded by walls.
     * @param width 
     * @param height 
     * @param tileSize 
     * @returns 
     */
    public static createTestMap(width: number, height: number, tileSize: number): Map {

        const map = new Map(width, height, tileSize);
        const floorTexture1 = AssetsManager.makeBricksTexture(new Size(64, 64), new Color(200, 140, 90), true);
        const floorTexture2 = AssetsManager.makeBricksTexture(new Size(64, 64), new Color(90, 140, 200), true);
        const wallTexture1 = AssetsManager.makeWallTexture(new Size(32, 32), new Color(255, 255, 100), true);
        const wallTexture2 = AssetsManager.makeWallTexture(new Size(32, 32), new Color(255, 100, 100), true);

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
                tile.floor = floorTexture1;
                tile.wall = wallTexture1;

                if(x == 1 && y == 1) tile.wall = wallTexture2;
                

                if(x % 2 == y % 2)  tile.floor = floorTexture2;

                map.tiles[y * map.size.width + x] = tile;
            }
        }

        return map;
    }

    /**
     * Get tile from map coordinates.
     * @param x 
     * @param y 
     * @returns 
     */
    public getTile(x: number, y: number): Tile | null {

        if (x < 0 || x >= this.size.width) return null;

        if (y < 0 || y >= this.size.height) return null;

        return this.tiles[y * this.size.width + x];
    }

    /**
     * Get tile from world position.
     * @param position 
     * @returns 
     */
    public getTileFromPosition(position: Point): Tile | null {

        const x = Math.floor(position.x / this.tileSize);
        const y = Math.floor(position.y / this.tileSize);

        return this.getTile(x, y);
    }
}
