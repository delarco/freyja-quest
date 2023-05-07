import { Color } from "./color";
import { Point } from "./point";
import { Size } from "./size";
import { Tile } from "./tile";

export class Map {

    public readonly size: Size;
    public readonly tiles: Array<Tile>;

    constructor(width: number, height: number, private tileSize: number) {

        this.size = new Size(width, height);
        this.tiles = new Array<Tile>(width * height);

        for (let y = 0; y < this.size.height; y++) {
            for (let x = 0; x < this.size.width; x++) {

                const tile = new Tile();
                
                const isWall = (
                    x == 0
                    || y == 0
                    || (x == this.size.width - 1)
                    || (y == this.size.height - 1)
                    || (x == 1 && y == 1)
                )

                tile.minimapColor = isWall 
                    ? new Color(170, 170, 170)
                    : new Color(221, 221, 221);

                tile.collision = isWall;

                this.tiles[y * this.size.width + x] = tile;
            }
        }
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
