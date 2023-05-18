import { Size } from "./size";
import { Texture } from "./texture";

export class Sprite {

    private framesTexture: Array<Texture>;

    constructor(
        public name: string,
        public texture: Texture,
        public size: Size,
        public frames: number,
    ) {
        
        this.framesTexture = new Array<Texture>();

        for(let i = 0; i < frames; i++) {
            
            const startX = i * size.width;            
            const frameTexture = new Texture(`${name}-${i}`, new Size(size.width, size.height), []);

            for(let y = 0; y < size.height; y++) {

                for(let x = startX; x < startX + size.width; x++) {

                    frameTexture.data.push(texture.getPixelColor(x, y));
                }
            }

            this.framesTexture.push(frameTexture);
        }        
    }

    public getFrame(frame: number): Texture {

        return this.framesTexture[frame];
    }
}
