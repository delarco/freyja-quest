import { Size } from "./models/size";
import { Minimap } from "./minimap";
import { Canvas2DRenderer } from "./renderer/canvas-2d-renderer";
import { Map } from "./models/map";
import { Player } from "./models/player";
import { Point } from "./models/point";

export class Game {

    private readonly minimapResolution = new Size(100, 100);   
    private readonly minimapScreenSize = new Size(500, 500);

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

        this.minimap!.draw();

        this.rafHandle = requestAnimationFrame(() => this.mainLoop());
    }
}
