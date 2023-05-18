import { AssetsManager } from "../assets-manager";
import { Color } from "../models/color";
import { Map } from "../models/map";
import { Point } from "../models/point";
import { Direction } from "../models/ray";
import { SpawnLocation } from "../models/spawn-location";
import { Sprite } from "../models/sprite";
import { Texture } from "../models/texture";
import { Tile } from "../models/tile";
import { ArrayUtils } from "./array-utils";

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

            if (!raw.wall) {
                tile.wall = {};
            }
            else if (typeof (raw.wall) == "string") {
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

            if (!raw['wall-detail']) {
                tile.wallDetails = {};
            }
            else if (typeof (raw['wall-detail']) == "string") {
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

        const sprites = jsonData.sprites.map((raw: any) => {

            return new Sprite(
                raw.texture,
                raw.texture,
                raw.size,
                raw.frames,
                new Point(raw.position.x, raw.position.y),
            );
        });

        const map = new Map(
            jsonData.name,
            jsonData.size.width,
            jsonData.size.height,
            tileSize,
            tiles,
            jsonData.spawnLocations,
            jsonData.skybox,
            jsonData.music,
            sprites
        );

        return map;
    }

    /**
     * Create a test map surrounded by walls.
     * @param width 
     * @param height 
     * @param tileSize 
     * @returns 
     */
    public static createTestMap(width: number, height: number, tileSize: number): Map {

        const spawnLocations = [new SpawnLocation(112, 67, 2.7)];
        const tiles = new Array<Tile>();

        const map = new Map('Test Map', width, height, tileSize, tiles, spawnLocations, 'skybox-night', [], []);
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
                tile.floorTexture = floorTexture;
                tile.wallTexture[Direction.NORTH] = wallTexture1;
                tile.wallTexture[Direction.SOUTH] = wallTexture2;
                tile.wallTexture[Direction.EAST] = wallTexture1;
                tile.wallTexture[Direction.WEST] = wallTexture2;

                if (x % 2 == y % 2) tile.floorTexture = floorTexture!;

                map.tiles[y * map.size.width + x] = tile;
            }
        }

        return map;
    }
}
