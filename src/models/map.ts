import { Audio } from "./audio";
import { Point } from "./point";
import { Size } from "./size";
import { SpawnLocation } from "./spawn-location";
import { Texture } from "./texture";
import { Tile } from "./tile";

export class Map {

    public readonly size: Size;
    public readonly worldSize: Size;
    public musics: Array<Audio>;
    public skyboxTexture: Texture;
    
    constructor(
        public name: string,
        public width: number,
        public height: number,
        public tileSize: number,
        public tiles: Array<Tile>,
        public spawnLocations: Array<SpawnLocation>,
        public skybox: string,
        public musicList: Array<string> = []) {

        this.size = new Size(width, height);
        this.worldSize = new Size(width * tileSize, height * tileSize);
        this.spawnLocations = spawnLocations;
        this.musics = new Array<Audio>();
        this.skyboxTexture = Texture.EMPTY;
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

    /**
     * Get a random spawn location from map.
     * @returns 
     */
    public getRandomSpawnLocation(): SpawnLocation {

        const location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
        return location;
    }
}
