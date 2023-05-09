import { Size } from "./models/size";
import { Minimap } from "./minimap";
import { Canvas2DRenderer } from "./renderer/canvas-2d-renderer";
import { Map } from "./models/map";
import { Player } from "./models/player";
import { Point } from "./models/point";
import { Clock } from "./clock";
import { RayCaster } from "./ray-caster";
import { Debugger } from "./debugger";
import { MathUtils } from "./utils/math-utils";
import { World } from "./world";
import { Canvas2DImageDataRenderer } from "./renderer/canvas-2d-image-data-renderer";
import { AssetsManager } from "./assets-manager";
import { Vector2 } from "./models/vector2";

export class Game {

    private readonly minimapResolution = new Size(100, 100);
    private readonly minimapScreenSize = new Size(200, 200);

    private readonly worldResolution = new Size(640, 480);
    private readonly worldScreenSize = new Size(800, 600);

    private readonly PLAYER_VELOCITY = 4;
    private readonly PLAYER_ROTATION = 0.15;
    private readonly RAYS_TO_CAST = this.worldResolution.width;

    /**
     * Tile size in world
     */
    private readonly TILE_SIZE = 32;

    /**
     * Key State
     */
    public keyState: { [key: string]: boolean } = {};

    /**
     * requestAnimationFrame handler
     */
    private rafHandle: number = -1;

    /**
     * Minimap
     */
    private minimap: Minimap | null = null;

    /**
     * Map
     */
    private map: Map | null = null;

    /**
     * Player
     */
    private player: Player | null = null;

    /**
     * Clock for FPS count and delta time to updates.
     */
    private clock = new Clock();

    /**
     * Ray caster
     */
    private rayCaster: RayCaster | null = null;

    /**
     * World.
     */
    private world: World | null = null;

    /**
     * Initialize assets manager, map, minimap, world and renderers.
     * @param minimapCanvas 
     */
    public async initialize(minimapCanvas: HTMLCanvasElement, worldCanvas: HTMLCanvasElement): Promise<void> {

        await AssetsManager.Instance.initialize(this.worldResolution, this.TILE_SIZE);

        this.map = AssetsManager.getMap('Test Map')!;
        await AssetsManager.loadMapAssets(this.map);

        const spawnLoc = this.map.getRandomSpawnLocation();
        this.player = new Player(new Point(spawnLoc.x, spawnLoc.y), spawnLoc.a);
        this.rayCaster = new RayCaster(this.RAYS_TO_CAST, this.map);

        const minimapRenderer = new Canvas2DRenderer(minimapCanvas, this.minimapResolution, this.minimapScreenSize);
        this.minimap = new Minimap(
            minimapRenderer,
            this.minimapResolution,
            this.map,
            this.player,
            this.rayCaster
        );

        const worldRenderer = new Canvas2DImageDataRenderer(worldCanvas, this.worldResolution, this.worldScreenSize);
        this.world = new World(
            worldRenderer,
            this.worldResolution,
            this.map,
            this.player,
            this.rayCaster
        );

        Debugger.clock = this.clock;
        Debugger.map = this.map;
        Debugger.player = this.player;
    }

    /**
     * Runs the game.
     */
    public run(): void {

        const music = this.map?.musics[0];

        if (music) {
            music.volume = 0.3;
            music.play();
        }

        this.rafHandle = requestAnimationFrame(() => this.mainLoop());
    }

    /**
     * Stops the game.
     */
    public stop(): void {

        if (this.rafHandle) {

            cancelAnimationFrame(this.rafHandle);
        }
    }

    /**
     * Main loop (update world and draw everything)
     */
    private mainLoop(): void {

        const update = this.clock.tick();

        if (update) {

            this.updatePlayer();
        }

        this.rayCaster!.cast(this.player!.position, this.player!.angle);
        this.draw();
        Debugger.update();
        Debugger.firstFrame = false;

        this.rafHandle = requestAnimationFrame(() => this.mainLoop());
    }

    /**
     * Draws minimap and world.
     */
    private draw(): void {

        this.minimap!.draw();
        this.world!.draw();
    }

    /**
     * Update player position
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

            this.player!.angle = MathUtils.fixAngle(this.player!.angle + this.PLAYER_ROTATION);
        }

        if (this.keyState['ArrowRight']) {

            this.player!.angle = MathUtils.fixAngle(this.player!.angle - this.PLAYER_ROTATION);
        }
    }

    /**
     * Rotate player when mouse moves horizontally.
     * @param movX 
     * @param movY 
     * @returns 
     */
    public mouseMovement(mov: Vector2) {

        if (!this.player) return;

        this.player.angle = MathUtils.fixAngle(this.player.angle - this.PLAYER_ROTATION * mov.x * 0.02);
    }
}
