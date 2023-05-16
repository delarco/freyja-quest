import { AssetsManager } from "../assets-manager";
import { Point } from "../models/point";
import { Texture } from "../models/texture";
import { Vector2 } from "../models/vector2";
import { IRenderer } from "../renderer/renderer";
import { Scene } from "./Scene";

export class TitleScreenScene implements Scene {

    private background: Texture | null = null;

    constructor(public renderer: IRenderer) { }

    public async initialize(): Promise<void> {

        this.background = await AssetsManager.loadTexture('title-screen.png');
    }

    public update(): void {

    }

    public mouseMovement(mov: Vector2): void {

    }

    public mouseClick(point: Point, button: number): void {

    }

    public draw(): void {

        if (this.background) this.renderer.drawTexture(0, 0, this.background);

        this.renderer.swapBuffer();
    }

    public dispose(): void {

        this.background = null;
    }
}
