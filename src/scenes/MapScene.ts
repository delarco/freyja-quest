import { AssetsManager } from "../assets-manager";
import { Debugger } from "../debugger";
import { Color } from "../models/color";
import { Map } from "../models/map";
import { Player } from "../models/player";
import { Point } from "../models/point";
import { Direction, Ray } from "../models/ray";
import { Size } from "../models/size";
import { Texture } from "../models/texture";
import { Vector2 } from "../models/vector2";
import { RayCaster } from "../ray-caster";
import { IRenderer } from "../renderer/renderer";
import { TypedEvent } from "../typed-event";
import { ArrayUtils } from "../utils/array-utils";
import { MathUtils } from "../utils/math-utils";
import { Scene } from "./Scene";

export class MapScene implements Scene {

    private player: Player | null = null;
    private map: Map | null = null;
    private rayCaster: RayCaster | null = null;
    private readonly RAYS_TO_CAST: number;
    private halfVerticalRes: number;

    private readonly PLAYER_VELOCITY = 4;
    private readonly PLAYER_ROTATION = 0.15;

    public onEnd = new TypedEvent<boolean>();

    constructor(
        public renderer: IRenderer,
        private resolution: Size,
        private keyState: { [key: string]: boolean }
    ) {

        this.RAYS_TO_CAST = this.resolution.width;
        this.halfVerticalRes = this.resolution.height / 2;
    }

    /**
     * Scene initialize.
     * @returns 
     */
    public async initialize(): Promise<void> {

        const mapLoad = await AssetsManager.loadMap('test.json');

        if (mapLoad instanceof Error) {

            alert('Error loading map');
            return;
        }

        this.map = mapLoad;
        await AssetsManager.loadMapAssets(this.map);

        const spawnLoc = this.map.getRandomSpawnLocation();
        this.player = new Player(new Point(spawnLoc.x, spawnLoc.y), spawnLoc.a);
        this.rayCaster = new RayCaster(this.RAYS_TO_CAST, this.map);

        this.playNextMusic();

        Debugger.map = this.map;
        Debugger.player = this.player;
    }

    /**
     * Scene update (player position and NPCs);
     */
    public update(): void {

        this.updatePlayer();

        for (let sprite of this.map!.sprites) sprite.update();
    }

    /**
     * Rotate player when mouse moves horizontally.
     * @param mov 
     */
    public mouseMovement(mov: Vector2): void {

        if (!this.player) return;

        this.player.angle = MathUtils.fixAngle(this.player.angle - this.PLAYER_ROTATION * mov.x * 0.02);
    }

    /**
     * Mouse click.
     * @param point 
     * @param button 
     */
    public mouseClick(point: Point, button: number): void {

    }

    /**
     * Update player position.
     */
    private updatePlayer(): void {

        const movePlayer = (mov: Point) => {

            const newXPos = new Point(this.player!.position.x + mov.x, this.player!.position.y);
            const newYPos = new Point(this.player!.position.x, this.player!.position.y + mov.y);
            const tileX = this.map!.getTileFromPosition(newXPos);
            const tileY = this.map!.getTileFromPosition(newYPos);

            if (!tileX?.collision && newXPos.x > 0 && newXPos.x < this.map!.worldSize.width) this.player!.position.x += mov.x;
            if (!tileY?.collision && newYPos.y > 0 && newYPos.y < this.map!.worldSize.height) this.player!.position.y += mov.y;
        };

        if (this.keyState['ArrowUp']) {

            const mov = new Point(
                Math.cos(this.player!.angle) * this.PLAYER_VELOCITY,
                -Math.sin(this.player!.angle) * this.PLAYER_VELOCITY
            );

            movePlayer(mov);
        }

        if (this.keyState['ArrowDown']) {

            const mov = new Point(
                -Math.cos(this.player!.angle) * this.PLAYER_VELOCITY,
                Math.sin(this.player!.angle) * this.PLAYER_VELOCITY
            );

            movePlayer(mov);
        }

        if (this.keyState['ArrowLeft']) {

            const mov = new Point(
                -Math.cos(this.player!.angle - MathUtils.rad90) * this.PLAYER_VELOCITY,
                Math.sin(this.player!.angle - MathUtils.rad90) * this.PLAYER_VELOCITY
            );

            movePlayer(mov);
        }

        if (this.keyState['ArrowRight']) {

            const mov = new Point(
                -Math.cos(this.player!.angle + MathUtils.rad90) * this.PLAYER_VELOCITY,
                Math.sin(this.player!.angle + MathUtils.rad90) * this.PLAYER_VELOCITY
            );

            movePlayer(mov);
        }
    }

    /**
     * Draws the skybox.
     * @param ray 
     * @param wallStartY 
     * @returns 
     */
    private drawSkybox(ray: Ray, wallStartY: number): void {

        if (!this.map) return;

        const x = ray.index;
        const tx = Math.floor(MathUtils.radiansToDegrees(ray.angle));
        const yScale = this.map.skyboxTexture.size.height / (this.resolution.height / 2);
        const lastY = Math.min(wallStartY, this.halfVerticalRes);

        for (let y of ArrayUtils.range(lastY)) {

            const ty = Math.floor(y * yScale);
            const color = this.map.skyboxTexture.getPixelColor(tx, ty);
            this.renderer.drawPixel(x, y, color);
        }
    }

    /**
     * Draws the floor and ceiling textures.
     * @param ray 
     * @param wallStartY 
     * @param wallHeight 
     * @returns 
     */
    private drawFloorCeiling(ray: Ray, wallStartY: number, wallHeight: number): void {

        if (!this.player || !this.map) return;

        const sin = Math.sin(ray.angle);
        const cos = Math.cos(ray.angle);
        const cosEyeFish = Math.cos(ray.angleFishEyeFix);

        for (let j of ArrayUtils.range(this.halfVerticalRes)) {

            const n = (this.halfVerticalRes / (this.halfVerticalRes - j)) / cosEyeFish;
            const x = this.player.position.x / this.map.tileSize + cos * n;
            const y = this.player.position.y / this.map.tileSize - sin * n;

            if (
                x < 0
                || y < 0
                || x > this.map.size.width
                || y > this.map.size.height
            ) continue;

            const pixelX = ray.index;
            const pixelY = this.halfVerticalRes * 2 - j - 1;

            const tile = this.map.getTile(Math.floor(x), Math.floor(y));
            let floorTexure = tile?.floorTexture;
            let ceilingTexture = tile?.ceilingTexture;

            const shade = 0.2 + 0.8 * (1 - j / this.halfVerticalRes);

            if (floorTexure && pixelY >= wallStartY + wallHeight) {

                let tx = Math.floor(x % 1 * (floorTexure.size.width - 1));
                let ty = Math.floor(y % 1 * (floorTexure.size.height - 1));

                if (tx < 0) tx = floorTexure.size.width + tx - 1;
                if (ty < 0) ty = floorTexure.size.height + ty - 1;

                let color = Color.shade(floorTexure.getPixelColor(tx, ty), shade);

                if (Math.floor(x) == 1 && Math.floor(y) == 1) {
                    color = Color.RED;
                }

                this.renderer.drawPixel(pixelX, pixelY, color);
            }

            if (ceilingTexture && this.resolution.height - pixelY < wallStartY) {

                let tx = Math.floor(x % 1 * (ceilingTexture.size.width - 1));
                let ty = Math.floor(y % 1 * (ceilingTexture.size.height - 1));

                if (tx < 0) tx = ceilingTexture.size.width + tx - 1;
                if (ty < 0) ty = ceilingTexture.size.height + ty - 1;

                const color = Color.shade(ceilingTexture.getPixelColor(tx, ty), shade);
                this.renderer.drawPixel(pixelX, this.resolution.height - pixelY, color);
            }
        }
    }

    /**
     * Draws walls.
     * @returns 
     */
    private drawRays(): void {

        if (!this.player || !this.map || !this.rayCaster) return;

        const lineWidth = this.resolution.width / this.rayCaster.rays.length;

        for (let index = 0; index < this.rayCaster.rays.length; index++) {

            const ray = this.rayCaster.rays[index];

            if (!ray.collidedTile) continue;

            const texture = ray.collidedTile.wallTexture[ray.collisionDirection] || Texture.EMPTY;
            const textureDetail = ray.collidedTile.wallDetailsTexture[ray.collisionDirection];
            const ca = MathUtils.fixAngle(this.player.angle - ray.angle);
            const distance = ray.size * Math.cos(ca);

            const lineHeight = Math.floor((this.map.tileSize * this.resolution.height) / distance);
            let lineDrawHeight = lineHeight;

            const textureStepY = texture.size.height / lineHeight;
            const textureDetailStepY = textureDetail?.size.height / lineHeight || 0;

            if (lineHeight > this.resolution.height) {

                lineDrawHeight = this.resolution.height;
            }

            const x = index * lineWidth;
            const lineOffsetY = Math.floor(this.halfVerticalRes - lineDrawHeight / 2);

            this.drawSkybox(ray, lineOffsetY);
            this.drawFloorCeiling(ray, lineOffsetY, lineDrawHeight);

            const hitVerticalFirst = ray.collisionDirection == Direction.EAST || ray.collisionDirection == Direction.WEST;

            const textureCoords = this.getTextureCoords(ray, lineHeight, textureStepY, hitVerticalFirst, texture);
            const textureDetailCoords = this.getTextureCoords(ray, lineHeight, textureDetailStepY, hitVerticalFirst, textureDetail);

            if (!textureCoords && !textureDetailCoords) continue;

            for (let y = lineOffsetY; y < lineOffsetY + lineDrawHeight; y++) {

                let color: Color | null = null;

                if (textureDetail && textureDetailCoords) {

                    let roundTextureDetailY = Math.floor(textureDetailCoords.y)
                    if (roundTextureDetailY > textureDetail.size.height - 1) roundTextureDetailY = textureDetail.size.height - 1;

                    color = textureDetail.getPixelColor(textureDetailCoords.x, roundTextureDetailY) || Color.WHITE;

                    if (color.a == 0) color = null;
                }

                if (color == null && textureCoords) {

                    let roundTextureY = Math.floor(textureCoords.y)
                    if (roundTextureY > texture.size.height - 1) roundTextureY = texture.size.height - 1;

                    color = texture.getPixelColor(textureCoords.x, roundTextureY) || Color.WHITE;
                }

                if (color) {

                    // TODO: move shade params to map JSON

                    // direction shade
                    if (!hitVerticalFirst) color = Color.shade(color, 0.6);

                    // distance shade
                    // TODO: distance shade should use tile size.
                    const shade = 0.2 + 0.8 * (1 - distance / this.halfVerticalRes);
                    //const shade = 1 - Math.min(distance / this.map.tileSize, 1);// * (1 - distance / this.halfVerticalRes);
                    color = Color.shade(color, shade);

                    if (textureCoords) textureCoords.y += textureStepY;
                    if (textureDetailCoords) textureDetailCoords.y += textureDetailStepY;

                    this.renderer.drawHorizontalLine(x, x + lineWidth - 1, y, color);
                }
            }
        }
    }

    /**
     * Get texture coords.
     * @param ray 
     * @param lineHeight 
     * @param textureStepY 
     * @param hitVerticalFirst 
     * @param texture 
     * @returns 
     */
    private getTextureCoords(ray: Ray, lineHeight: number, textureStepY: number, hitVerticalFirst: boolean, texture: Texture): Point | null {

        if (!texture || !this.map) return null;

        let textureOffsetY = 0;

        if (lineHeight > this.resolution.height) {

            textureOffsetY = (lineHeight - this.resolution.height) / 2;
        }

        let textureY = textureOffsetY * textureStepY;
        let textureX = 0;

        if (!hitVerticalFirst) {

            const tileSizeOverTexWidth = this.map.tileSize / texture.size.width;

            textureX = (ray.destination.x / tileSizeOverTexWidth) % texture.size.width;
            if (ray.angle > MathUtils.rad180) textureX = texture.size.width - textureX;
        }

        if (hitVerticalFirst) {

            const tileOverTexWidth = this.map.tileSize / texture.size.width;

            textureX = (ray.destination.y / tileOverTexWidth) % texture.size.width;
            if (ray.angle > MathUtils.rad90 && ray.angle < MathUtils.rad270) textureX = texture.size.width - textureX;
        }

        const roundTextureX = Math.floor(textureX);

        return new Point(roundTextureX, textureY);
    }

    /**
     * Draw sprites.
     */
    private drawSprites(): void {

        for (let sprite of this.map!.sprites) {

            const distance = sprite.position.distance(this.player!.position);

            const dXdY = new Vector2(
                sprite.position.x - this.player!.position.x,
                sprite.position.y - this.player!.position.y
            );

            const theta = MathUtils.fixAngle(Math.atan2(-dXdY.y, dXdY.x));
            let leftMostRay = MathUtils.fixAngle(this.player!.angle + (MathUtils.rad60 / 2) - theta);
            let delta = theta - this.player!.angle;
            
            const FOV = MathUtils.rad60;
            const HALF_FOV = FOV / 2;
            const norm_dist = distance * Math.cos(delta);
            const SCREEN_DIST = (this.resolution.width / 2) / Math.tan(HALF_FOV);
            const PROJ = SCREEN_DIST / norm_dist;

            let screenPos = new Point(
                leftMostRay * (this.resolution.width / MathUtils.rad60),
                (this.resolution.height / 2)
            );

            screenPos = new Point(
                Math.floor(screenPos.x),
                Math.floor(screenPos.y)
            );

            if(distance > 16 && PROJ > 0 && PROJ < 32) {

                const frameTexture = sprite.currentFrame;

                if(!frameTexture) continue;

                const spScreen = new Point(
                    Math.floor(screenPos.x - (frameTexture.size.width / 2 * PROJ)),
                    Math.floor(screenPos.y - (frameTexture.size.height / 2 * PROJ)),
                );
        
                this.renderer.drawTexture(spScreen.x, spScreen.y, frameTexture, PROJ);
            }
        }
    }

    /**
     * Scene draw.
     */
    public draw(): void {

        this.rayCaster!.cast(this.player!.position, this.player!.angle);
        this.renderer.clear(Color.RED);
        this.drawRays();
        this.drawSprites();
        this.renderer.swapBuffer();
    }

    /**
     * Scene dispose.
     */
    public dispose(): void {

    }

    /**
     * Plays next map music.
     */
    private playNextMusic(): void {

        const music = this.map?.musics[0];

        if (music) {

            music.onPlayEnded.on(() => {
                // TODO: play next music
            });

            music.loop = true;
            music.volume = 0.3;
            music.play();
        }
    }
}
