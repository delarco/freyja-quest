import { Size } from "./models/size";
import { Minimap } from "./minimap";
import { Canvas2DRenderer } from "./renderer/canvas-2d-renderer";

export class Game {

    private readonly minimapResolution = new Size(100, 100);   
    private readonly minimapScreenSize = new Size(500, 500);

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
     * Initialize minimap and renderer.
     * @param minimapCanvas 
     */
    public initialize(minimapCanvas: HTMLCanvasElement): void {

        const minimapRenderer = new Canvas2DRenderer(minimapCanvas, this.minimapResolution, this.minimapScreenSize);
        this.minimap = new Minimap(minimapRenderer, this.minimapResolution);
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
