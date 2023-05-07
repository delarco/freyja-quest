import { Size } from "./models/size";
import { Minimap } from "./minimap";
import { Canvas2DRenderer } from "./renderer/canvas-2d-renderer";
import { Map } from "./models/map";
import { Player } from "./models/player";
import { Point } from "./models/point";
import { Clock } from "./clock";
import { RayCaster } from "./ray-caster";

export class Game {

    private readonly minimapResolution = new Size(100, 100);
    private readonly minimapScreenSize = new Size(500, 500);

    private readonly PLAYER_VELOCITY = 4;
    private readonly RAYS_TO_CAST = 400;

    /**
     * Tile size in world
     */
    private readonly TILE_SIZE = 20;

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
     * Initialize map, minimap and renderer.
     * @param minimapCanvas 
     */
    public initialize(minimapCanvas: HTMLCanvasElement): void {

        this.map = new Map(10, 10, this.TILE_SIZE);
        this.player = new Player(new Point(90, 90));
        this.rayCaster = new RayCaster(this.RAYS_TO_CAST);

        const minimapRenderer = new Canvas2DRenderer(minimapCanvas, this.minimapResolution, this.minimapScreenSize);
        this.minimap = new Minimap(
            minimapRenderer,
            this.minimapResolution,
            this.TILE_SIZE,
            this.map,
            this.player,
            this.rayCaster
        );
    }

    /**
     * Runs the game.
     */
    public run(): void {

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

        this.rafHandle = requestAnimationFrame(() => this.mainLoop());
    }

    /**
     * Draws minimap and world.
     */
    private draw(): void {

        this.minimap!.draw();
    }

    /**
     * Update player position
     */
    private updatePlayer(): void {

        const movePlayer = (mov: Point) => {

            const tileX = this.map!.getTileFromPosition(new Point(this.player!.position.x + mov.x, this.player!.position.y));
            const tileY = this.map!.getTileFromPosition(new Point(this.player!.position.x, this.player!.position.y + mov.y));
                        
            if(!tileX?.collision) this.player!.position.x += mov.x;
            if(!tileY?.collision) this.player!.position.y += mov.y;
        };

        if (this.keyState['ArrowUp']) {

            const mov = new Point(
                Math.cos(this.player!.angle) * this.PLAYER_VELOCITY,
                Math.sin(this.player!.angle) * this.PLAYER_VELOCITY
            );

            movePlayer(mov);
        }

        if (this.keyState['ArrowDown']) {

            const mov = new Point(
                -Math.cos(this.player!.angle) * this.PLAYER_VELOCITY,
                -Math.sin(this.player!.angle) * this.PLAYER_VELOCITY
            );

            movePlayer(mov);
        }

        if (this.keyState['ArrowLeft']) {

            this.player!.angle -= 0.15;
        }

        if (this.keyState['ArrowRight']) {

            this.player!.angle += 0.15;
        }
    }
}
