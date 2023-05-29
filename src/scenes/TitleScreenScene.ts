import { AssetsManager } from "../assets-manager";
import { Audio, AudioType } from "../models/audio";
import { Color } from "../models/color";
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
    private music: Audio | null = null;
    private colorCounter: number = 100;
    private colorCounterInc: number = 10;

    private titleColor: Color = new Color(100, 100, 255);
    private clickHereColor = new Color(200, 200, 255);

    public onEnd = new TypedEvent<boolean>();

    constructor(public renderer: IRenderer, private resolution: Size) { }

    public async initialize(): Promise<void> {

        this.background = await AssetsManager.loadTexture('title-screen.png');
        this.clickHere = await AssetsManager.loadTexture('click-start.png');
        this.music = await AssetsManager.loadAudio('medieval-chateau.mp3', AudioType.MUSIC);

        this.music.loop = true;
        this.music.volume = 0.3;
        this.music.play();
    }

    public update(): void {

        this.colorCounter += this.colorCounterInc;
        this.clickHereColor.r = this.colorCounter;
        this.clickHereColor.g = this.colorCounter;

        if (this.colorCounter <= 100 || this.colorCounter >= 200)
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
        this.renderer.drawText("Freyja Quest", 126, 40, 64, this.titleColor, true, 1, Color.BLUE);
        this.renderer.drawText("Click here to start", 142, 340, 42, this.clickHereColor, true, 1, Color.BLUE);
        this.renderer.swapBuffer();
    }

    public dispose(): void {

        this.background = null;
    }
}
