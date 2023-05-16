import { Audio, AudioType } from "./models/audio";
import { Color } from "./models/color";
import { Map } from "./models/map";
import { Point } from "./models/point";
import { Direction } from "./models/ray";
import { Size } from "./models/size";
import { SpawnLocation } from "./models/spawn-location";
import { Texture } from "./models/texture";
import { Tile } from "./models/tile";
import { ArrayUtils } from "./utils/array-utils";
import { MapUtils } from "./utils/map-utils";
import { TextureUtils } from "./utils/texture-utils";

// TODO: split assets manager class
export class AssetsManager {

    private static _instance: AssetsManager;
    private static tileSize: number;
    public static readonly textures: Array<Texture> = [];
    public static readonly maps: Array<Map> = [];
    public static readonly audios: Array<Audio> = [];
    public static DEBUG_TEXTURE: Texture;

    public static get Instance() {

        return this._instance || (this._instance = new AssetsManager());
    }

    public async initialize(resolution: Size, tileSize: number) {

        AssetsManager.tileSize = tileSize;

        // generate memory test textures
        AssetsManager.makeTestTexture('mem-test-32x32', new Size(32, 32));

        // load some textures
        await AssetsManager.loadTexture('bricks.tex');
        await AssetsManager.loadTexture('rocks.tex');
        await AssetsManager.loadTexture('rocks-sand.tex');
        await AssetsManager.loadTexture('bricks-sand.tex');

        // generate skyboxes
        AssetsManager.makeSkyBoxDayTexture(resolution.height / 2);
        AssetsManager.makeSkyBoxNightTexture(resolution.height / 2);

        // load test map
        await AssetsManager.loadMap('test.json');

        // load music
        AssetsManager.loadAudio('medieval-chateau.mp3', AudioType.MUSIC);
        AssetsManager.loadAudio('test.wav', AudioType.SOUND_EFFECT);

        AssetsManager.DEBUG_TEXTURE = await AssetsManager.loadTexture('debug.png');
    }

    /**
     * Returns a texture by it's name.
     * @param name Texture name
     */
    public static getTexture(name: string): Texture | null {

        return AssetsManager.textures.find(texture => texture.name == name) || null;
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

        AssetsManager.textures.push(texture);
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

        AssetsManager.textures.push(texture);
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
    public static async loadTexture(filename: string, debugBorders: boolean = false): Promise<Texture> {

        return new Promise(
            (resolve, reject) => {

                fetch(`assets/textures/${filename}`)
                    .then(async result => {

                        const fileExt = filename.split('.').pop()?.toUpperCase();

                        let texture: Texture | null = null;

                        switch (fileExt) {

                            case 'TEX':

                                const data = new Uint8Array(await result.arrayBuffer());
                                texture = TextureUtils.deserialize(data);

                                break;

                            case 'JPG':
                            case 'PNG':

                                const bitmap = await createImageBitmap(await result.blob());

                                const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
                                const context = canvas.getContext('2d')!;
                                // TODO: fix error Property 'drawImage' does not exist on type 'OffscreenRenderingContext'.
                                context.drawImage(bitmap, 0, 0);
                                var imageData = context.getImageData(0, 0, bitmap.width, bitmap.height);

                                texture = new Texture(filename, new Size(imageData.width, imageData.height));

                                const colorBytes = imageData.data.length / (imageData.width * imageData.height);

                                if (colorBytes != 4) {
                                    throw new Error('Not 4-byte color');
                                }

                                for (let index = 0; index < imageData.data.length; index += 4) {

                                    texture.data.push(new Color(
                                        imageData.data[index + 0],
                                        imageData.data[index + 1],
                                        imageData.data[index + 2],
                                        imageData.data[index + 3]
                                    ));
                                }

                                break;
                        }

                        if (texture && debugBorders) {

                            for (let x of ArrayUtils.range(texture.size.width)) {

                                texture.drawPixel(x, 0, Color.BLACK);
                                texture.drawPixel(x, texture.size.height - 1, Color.BLACK);
                            }

                            for (let y of ArrayUtils.range(texture.size.height)) {

                                texture.drawPixel(0, y, Color.BLACK);
                                texture.drawPixel(texture.size.width - 1, y, Color.BLACK);
                            }

                            texture.drawPixel(1, 1, Color.RED);
                            texture.drawPixel(texture.size.width - 2, texture.size.height - 2, Color.GREEN);
                        }


                        if (texture) {
                            AssetsManager.textures.push(texture);
                            return resolve(texture);
                        }

                        throw new Error();
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

        return AssetsManager.maps.find(map => map.name == name) || null;
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

        const map = new Map('Test Map', width, height, tileSize, tiles, spawnLocations, 'skybox-night');
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

    /**
     * Load map file from assets.
     * @param filename 
     * @returns 
     */
    public static async loadMap(filename: string): Promise<Map | Error> {

        return fetch(`assets/maps/${filename}`)
            .then(result => result.json())
            .then((data: any) => {

                const map = MapUtils.fromJson(data, AssetsManager.tileSize);
                AssetsManager.maps.push(map);
                return map;
            })
            .catch(error => {

                alert(`Error loading texture: ${filename} (${error})`);
                return new Error(error);
            });
    }

    /**
     * Load all textures required by a map
     * @param map Map object
     */
    public static async loadMapAssets(map: Map): Promise<void> {

        const textureList = new Set([
            ...map.tiles.map(tile => tile.wall[Direction.NORTH]),
            ...map.tiles.map(tile => tile.wall[Direction.SOUTH]),
            ...map.tiles.map(tile => tile.wall[Direction.EAST]),
            ...map.tiles.map(tile => tile.wall[Direction.WEST]),
            ...map.tiles.map(tile => tile.wallDetails[Direction.NORTH]),
            ...map.tiles.map(tile => tile.wallDetails[Direction.SOUTH]),
            ...map.tiles.map(tile => tile.wallDetails[Direction.EAST]),
            ...map.tiles.map(tile => tile.wallDetails[Direction.WEST]),
            ...map.tiles.map(tile => tile.floor),
            ...map.tiles.map(tile => tile.ceiling),
        ]);

        for (let filename of textureList) {

            if (!filename) continue;

            const texture = await AssetsManager.loadTexture(filename as string);

            map.tiles
                .filter(f => f.wall[Direction.NORTH] == filename)
                .forEach(tile => tile.wallTexture[Direction.NORTH] = texture);

            map.tiles
                .filter(f => f.wall[Direction.SOUTH] == filename)
                .forEach(tile => tile.wallTexture[Direction.SOUTH] = texture);
                
            map.tiles
                .filter(f => f.wall[Direction.EAST] == filename)
                .forEach(tile => tile.wallTexture[Direction.EAST] = texture);

            map.tiles
                .filter(f => f.wall[Direction.WEST] == filename)
                .forEach(tile => tile.wallTexture[Direction.WEST] = texture);

            map.tiles
                .filter(f => f.wallDetails[Direction.NORTH] == filename)
                .forEach(tile => tile.wallDetailsTexture[Direction.NORTH] = texture);

            map.tiles
                .filter(f => f.wallDetails[Direction.SOUTH] == filename)
                .forEach(tile => tile.wallDetailsTexture[Direction.SOUTH] = texture);
                
            map.tiles
                .filter(f => f.wallDetails[Direction.EAST] == filename)
                .forEach(tile => tile.wallDetailsTexture[Direction.EAST] = texture);

            map.tiles
                .filter(f => f.wallDetails[Direction.WEST] == filename)
                .forEach(tile => tile.wallDetailsTexture[Direction.WEST] = texture);

            map.tiles
                .filter(f => f.floor == filename)
                .forEach(tile => tile.floorTexture = texture);

            map.tiles
                .filter(f => f.ceiling == filename)
                .forEach(tile => tile.ceilingTexture = texture);
        }

        map.skyboxTexture = await AssetsManager.loadTexture(map.skybox) || Texture.EMPTY;

        const musicList = new Array<Audio>();

        for (let musicFile of map.musicList) {

            musicList.push(AssetsManager.loadAudio(musicFile, AudioType.MUSIC));
        }

        map.musics = musicList;
    }

    /**
     * Load audio from assets.
     * @param filename 
     * @returns 
     */
    public static loadAudio(filename: string, type: AudioType): Audio {

        // TODO: check if audio is already loaded

        let typeDir = '';

        switch (type) {

            case AudioType.MUSIC: typeDir = 'musics'; break;
            case AudioType.SOUND_EFFECT: typeDir = 'sounds'; break;
        }

        const url = `assets/${typeDir}/${filename}`;
        const audioElement = new window.Audio(url);
        audioElement.preload = "metadata";

        const audio = new Audio(filename, type, audioElement);
        AssetsManager.audios.push(audio);
        return audio;
    }

    /**
     * Returns an audio by it's file name.
     * @param name Audio file name
     */
    public static getAudio(filename: string): Audio | null {

        return AssetsManager.audios.find(audio => audio.filename == filename) || null;
    }
}
