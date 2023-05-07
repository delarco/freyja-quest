import { Point } from "./point";
import { Size } from "./size";

export class Map {

    public readonly size: Size;
    public readonly tiles: Array<number>;

    constructor(width: number, height: number, private tileSize: number) {

        this.size = new Size(width, height);
        this.tiles = new Array<number>(width * height);

        for (let y = 0; y < this.size.height; y++) {
            for (let x = 0; x < this.size.width; x++) {

                this.tiles[y * this.size.width + x] = (
                    x == 0
                    || y == 0
                    || (x == this.size.width - 1)
                    || (y == this.size.height - 1)
                    || (x == 1 && y == 1)
                ) ? 1 : 0
            }
        }
    }

    /**
     * Get tile from map coordinates.
     * @param x 
     * @param y 
     * @returns 
     */
    public getTile(x: number, y: number): number | null {

        if (x < 0 || x >= this.size.width) return null;

        if (y < 0 || y >= this.size.height) return null;

        return this.tiles[y * this.size.width + x];
    }

    /**
     * Get tile from world position.
     * @param position 
     * @returns 
     */
    public getTileFromPosition(position: Point): number | null {

        const x = Math.floor(position.x / this.tileSize);
        const y = Math.floor(position.y / this.tileSize);

        return this.getTile(x, y);
    }
}
