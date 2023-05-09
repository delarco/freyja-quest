import { Vector2 } from "./models/vector2";
import { MouseInput } from "./mouse-input";
import { TypedEvent } from "./typed-event";

export class GUI {

    private _minimapCanvas: HTMLCanvasElement | null = null;
    private _worldCanvas: HTMLCanvasElement | null = null;

    private mouseInput: MouseInput | null = null;

    public onKeyDown = new TypedEvent<string>();
    public onKeyUp = new TypedEvent<string>();
    public onMouseMove: TypedEvent<Vector2> | null = null;

    /**
     * Returns the minimap canvas
     */
    public get minimapCanvas(): HTMLCanvasElement {
        
        if(!this._minimapCanvas) throw new Error('Minimap canvas does not exists.');
        return this._minimapCanvas;
    }

    /**
     * Returns the world canvas
     */
    public get worldCanvas(): HTMLCanvasElement {
        
        if(!this._worldCanvas) throw new Error('World canvas does not exists.');
        return this._worldCanvas;
    }

    /**
     * Get DOM elements references and bind events.
     */
    public initialize(): void {

        this._minimapCanvas = document.querySelector<HTMLCanvasElement>('#minimap')!;
        if(!this._minimapCanvas) throw new Error('Minimap canvas not found.');

        this._worldCanvas = document.querySelector<HTMLCanvasElement>('#world')!;
        if(!this._worldCanvas) throw new Error('World canvas not found.');

        this.mouseInput = new MouseInput(this._worldCanvas);
        this.mouseInput.initialize();

        this.bindEvents();
    }

    /**
     * Bind window/document events.
     */
    private bindEvents(): void {

        window.addEventListener('keydown', (event: KeyboardEvent) => this.onKeyDown.emit(event.key));
        window.addEventListener('keyup', (event: KeyboardEvent) => this.onKeyUp.emit(event.key));

        this.onMouseMove = this.mouseInput!.onMove;
    }
}
