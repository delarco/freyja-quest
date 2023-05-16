import { AssetsManager } from "../assets-manager";
import { Audio, AudioType } from "../models/audio";
import { Point } from "../models/point";
import { Size } from "../models/size";
import { Texture } from "../models/texture";
import { Vector2 } from "../models/vector2";
import { IRenderer } from "../renderer/renderer";
import { TypedEvent } from "../typed-event";
import { Scene } from "./Scene";

export class TitleScreenScene implements Scene {

    private background: Texture | null = null;
    private clickHere: Texture | null = null;
    private clickHerePosition: Point = new Point();
    private music: Audio | null = null;
    private colorCounter: number = 0;
    private colorCounterInc: number = 10;

    public onEnd = new TypedEvent<boolean>();

    constructor(public renderer: IRenderer, private resolution: Size) { }

    public async initialize(): Promise<void> {

        this.background = await AssetsManager.loadTexture('title-screen.png');
        this.clickHere = await AssetsManager.loadTexture('click-start.png');
        this.music = await AssetsManager.loadAudio('medieval-chateau.mp3', AudioType.MUSIC);

        this.clickHerePosition = new Point(
            this.resolution.width / 2 - this.clickHere.size.width / 2,
            this.resolution.height / 2 - this.clickHere.size.height / 2,
        );

        this.music.loop = true;
        this.music.volume = 0.3;
        this.music.play();
    }

    public update(): void {
        
        this.clickHere?.data.forEach(color => {

            color.r = this.colorCounter;
            color.b = this.colorCounter;
        });

        this.colorCounter += this.colorCounterInc;

        if (this.colorCounter <= 0 || this.colorCounter >= 130)
            this.colorCounterInc *= -1;
    }

    public mouseMovement(mov: Vector2): void {

    }

    public mouseClick(point: Point, button: number): void {

        this.music?.pause();
        this.onEnd.emit(true);
    }

    public draw(): void {

        if (!this.background || !this.clickHere) return;

        this.renderer.drawTexture(0, 0, this.background);
        this.renderer.drawTexture(this.clickHerePosition.x, this.clickHerePosition?.y, this.clickHere);

        this.renderer.swapBuffer();
    }

    public dispose(): void {

        this.background = null;
    }
}
