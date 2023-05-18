import { Point } from "./point";
import { Size } from "./size";
import { Texture } from "./texture";

export class Sprite {

    private framesTexture: Array<Texture> | null = null;
    private currentFrameCounter = 0;

    constructor(
        public name: string,
        public textureFilename: string,
        public size: Size,
        public frames: number,
        public position: Point,
    ) { }

    public get currentFrame(): Texture | null {

        const sprite = this.framesTexture![this.currentFrameCounter];

        return sprite;
    }

    public generateFrames(texture: Texture): void {

        this.framesTexture = new Array<Texture>();

        for (let i = 0; i < this.frames; i++) {

            const startX = i * this.size.width;
            const frameTexture = new Texture(`${this.name}-${i}`, new Size(this.size.width, this.size.height), []);

            for (let y = 0; y < this.size.height; y++) {

                for (let x = startX; x < startX + this.size.width; x++) {

                    frameTexture.data.push(texture.getPixelColor(x, y));
                }
            }

            this.framesTexture.push(frameTexture);
        }
    }

    public getFrame(frame: number): Texture {

        return this.framesTexture![frame];
    }

    public update(): void {
        
        this.currentFrameCounter++;
        if (this.currentFrameCounter == this.frames) this.currentFrameCounter = 0;
    }
}
