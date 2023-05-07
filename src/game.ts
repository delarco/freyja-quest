import { Size } from "./models/size";
import { Minimap } from "./minimap";
import { Canvas2DRenderer } from "./renderer/canvas-2d-renderer";
import { Map } from "./models/map";
import { Player } from "./models/player";
import { Point } from "./models/point";
import { Clock } from "./clock";

export class Game {

    private readonly minimapResolution = new Size(100, 100);
    private readonly minimapScreenSize = new Size(500, 500);

    private readonly PLAYER_VELOCITY = 4;

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
     * Initialize map, minimap and renderer.
     * @param minimapCanvas 
     */
    public initialize(minimapCanvas: HTMLCanvasElement): void {

        this.map = new Map(10, 10);
        this.player = new Player(new Point(90, 90));

        const minimapRenderer = new Canvas2DRenderer(minimapCanvas, this.minimapResolution, this.minimapScreenSize);
        this.minimap = new Minimap(this.map, this.player, minimapRenderer, this.minimapResolution, this.TILE_SIZE);
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

        if (this.keyState['ArrowUp']) {

            this.player!.position.x += Math.cos(this.player!.angle) * this.PLAYER_VELOCITY;
            this.player!.position.y += Math.sin(this.player!.angle) * this.PLAYER_VELOCITY;
        }

        if (this.keyState['ArrowDown']) {

            this.player!.position.x -= Math.cos(this.player!.angle) * this.PLAYER_VELOCITY;
            this.player!.position.y -= Math.sin(this.player!.angle) * this.PLAYER_VELOCITY;
        }

        if (this.keyState['ArrowLeft']) {

            this.player!.angle -= 0.15;
        }

        if (this.keyState['ArrowRight']) {

            this.player!.angle += 0.15;
        }
    }
}
