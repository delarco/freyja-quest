import { Size } from "./models/size";
import { Clock } from "./utils/clock";
import { Debugger } from "./debugger";
import { Canvas2DImageDataRenderer } from "./renderer/canvas-2d-image-data-renderer";
import { AssetsManager } from "./assets-manager";
import { Vector2 } from "./models/vector2";
import { Scene } from "./scenes/Scene";
import { IRenderer } from "./renderer/renderer";
import { MapScene } from "./scenes/MapScene";
import { TitleScreenScene } from "./scenes/TitleScreenScene";
import { ClickEvent } from "./utils/click-event";

export class Game {

    /**
     * Drawing area.
     */
    private readonly resolution = new Size(640, 480);

    /**
     * Canvas size.
     */
    private readonly screenSize = new Size(800, 600);

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
     * Clock for FPS count and delta time to updates.
     */
    private clock = new Clock();

    /**
     * Main canvas renderer.
     */
    private renderer: IRenderer | null = null;

    /**
     * Current scene.
     */
    private scene: Scene | null = null;

    /**
     * Initialize assets manager, map, minimap, world and renderers.
     * @param minimapCanvas 
     */
    public async initialize(minimapCanvas: HTMLCanvasElement, worldCanvas: HTMLCanvasElement): Promise<void> {

        this.renderer = new Canvas2DImageDataRenderer(worldCanvas, this.resolution, this.screenSize);
        await AssetsManager.Instance.initialize(this.resolution, this.TILE_SIZE);

        this.scene = new TitleScreenScene(this.renderer, this.resolution);
        await this.scene.initialize();

        this.scene.onEnd.on(flag => this.onTitleScreenEnd(flag));

        Debugger.clock = this.clock;
    }

    private async onTitleScreenEnd(flag: boolean): Promise<void> {

        const mapScene = new MapScene(this.renderer!, this.resolution, this.keyState);
        await mapScene.initialize();

        this.scene = mapScene;
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

            this.scene?.update();
        }

        this.draw();
        Debugger.update();
        Debugger.firstFrame = false;

        this.rafHandle = requestAnimationFrame(() => this.mainLoop());
    }

    /**
     * Draws minimap and world.
     */
    private draw(): void {

        this.scene?.draw();
    }

    /**
     * Mouse movement event.
     * @param movX 
     * @param movY 
     * @returns 
     */
    public mouseMovement(mov: Vector2) {

        this.scene?.mouseMovement(mov);
    }

    /**
     * Mouse click event.
     * @param ev 
     */
    public mouseClick(ev: ClickEvent) {

        this.scene?.mouseClick(ev.point, ev.button);
    }
}
