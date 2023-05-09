import { AssetsManager } from "../assets-manager";
import { Color } from "../models/color";
import { Map } from "../models/map";
import { Point } from "../models/point";
import { Texture } from "../models/texture";
import { Tile } from "../models/tile";

export class MapUtils {

    /**
     * Load map data from raw json.
     * @param jsonData 
     * @returns 
     */
    public static fromJson(jsonData: any, tileSize: number): Map {

        const tiles = jsonData.tiles.map((raw: any) => {

            const tile = new Tile();

            tile.minimapColor = new Color(raw.minimapColor[0], raw.minimapColor[1], raw.minimapColor[2]);
            tile.collision = raw.collision;
            tile.index = new Point(raw.index.x, raw.index.y);
            tile.position = new Point(raw.index.x * tileSize, raw.index.y * tileSize);
            tile.wall = raw.wall || "";
            tile.floor = raw.floor || "";
            tile.ceiling = raw.ceiling || "";

            return tile;
        });

        const skyboxTexture = AssetsManager.getTexture(jsonData.skybox) || Texture.EMPTY;        

        const map = new Map(
            jsonData.name,
            jsonData.size.width,
            jsonData.size.height,
            tileSize,
            tiles,
            jsonData.spawnLocations,
            skyboxTexture
        );

        return map;
    }

}
