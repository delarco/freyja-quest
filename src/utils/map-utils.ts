import { Color } from "../models/color";
import { Map } from "../models/map";
import { Point } from "../models/point";
import { Direction } from "../models/ray";
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
            tile.floor = raw.floor || "";
            tile.ceiling = raw.ceiling || "";

            if(!raw.wall) {
                tile.wall = {};
            }
            else if(typeof(raw.wall) == "string") {
                tile.wall[Direction.NORTH] = raw.wall;
                tile.wall[Direction.SOUTH] = raw.wall;
                tile.wall[Direction.EAST] = raw.wall;
                tile.wall[Direction.WEST] = raw.wall;
            }
            else {
                tile.wall[Direction.NORTH] = raw.wall.north;
                tile.wall[Direction.SOUTH] = raw.wall.south;
                tile.wall[Direction.EAST] = raw.wall.east;
                tile.wall[Direction.WEST] = raw.wall.west;
            }
               
            if(!raw['wall-detail']) {
                tile.wallDetails = {};
            }
            else if(typeof(raw['wall-detail']) == "string") {
                tile.wallDetails[Direction.NORTH] = raw['wall-detail'];
                tile.wallDetails[Direction.SOUTH] = raw['wall-detail'];
                tile.wallDetails[Direction.EAST] = raw['wall-detail'];
                tile.wallDetails[Direction.WEST] = raw['wall-detail'];
            }
            else {
                tile.wallDetails[Direction.NORTH] = raw['wall-detail'].north;
                tile.wallDetails[Direction.SOUTH] = raw['wall-detail'].south;
                tile.wallDetails[Direction.EAST] = raw['wall-detail'].east;
                tile.wallDetails[Direction.WEST] = raw['wall-detail'].west;
            }

            return tile;
        });

        const map = new Map(
            jsonData.name,
            jsonData.size.width,
            jsonData.size.height,
            tileSize,
            tiles,
            jsonData.spawnLocations,
            jsonData.skybox,
            jsonData.music
        );

        return map;
    }

}
