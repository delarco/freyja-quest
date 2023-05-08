import { Point } from "./point";
import { Size } from "./size";
import { Tile } from "./tile";

export class Map {

    public readonly name: string;
    public readonly size: Size;
    public readonly tiles: Array<Tile>;
    public readonly worldSize: Size;
    public readonly tileSize: number;

    constructor(name: string, width: number, height: number, tileSize: number) {

        this.name = name;
        this.tileSize = tileSize;
        this.size = new Size(width, height);
        this.tiles = new Array<Tile>(width * height);
        this.worldSize = new Size(width * tileSize, height * tileSize);
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
