import { Audio, AudioType } from "./models/audio";
import { Color } from "./models/color";
import { Map } from "./models/map";
import { Direction } from "./models/ray";
import { Size } from "./models/size";
import { Texture } from "./models/texture";
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

    public static get Instance() {

        return this._instance || (this._instance = new AssetsManager());
    }

    public async initialize(resolution: Size, tileSize: number) {

        AssetsManager.tileSize = tileSize;
    }

    /**
     * Returns a texture by it's name.
     * @param name Texture name
     */
    public static getTexture(name: string): Texture | null {

        return AssetsManager.textures.find(texture => texture.name == name) || null;
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
