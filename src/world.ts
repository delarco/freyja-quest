import { Color } from "./models/color";
import { Map } from "./models/map";
import { Player } from "./models/player";
import { Size } from "./models/size";
import { Texture } from "./models/texture";
import { RayCaster } from "./ray-caster";
import { IRenderer } from "./renderer/renderer";
import { ArrayUtils } from "./utils/array-utils";
import { MathUtils } from "./utils/math-utils";

export class World {

    private BG_COLOR = new Color(200, 200, 200);

    private skyboxTexture = Texture.makeSkyBox();

    constructor(
        private renderer: IRenderer,
        private resolution: Size,
        private map: Map,
        private player: Player,
        private rayCaster: RayCaster) {}

    public drawSkybox(): void {

        for(let x = 0; x < this.resolution.width; x++) {

            const ray = this.rayCaster.rays[x];

            for(let y of ArrayUtils.range(this.resolution.height / 2)){

                const ty = y;
                let tx = Math.floor(MathUtils.radiansToDegrees(ray.angle) % 360)
                
                if(tx < 0) tx = this.skyboxTexture.size.width + tx - 1
                
                const color = this.skyboxTexture.getPixelColor(tx, ty);

                this.renderer.drawPixel(x, y, color);
              }
        }
    }

    public drawRays(): void {

        const halfVerticalRes = this.resolution.height / 2;
        const lineWidth = this.resolution.width / this.rayCaster.rays.length;

        for (let index = 0; index < this.rayCaster.rays.length; index++) {

            const ray = this.rayCaster.rays[index];

            if(!ray.collidedTile) continue;

            const ca = MathUtils.fixAngle(this.player.angle - ray.angle);
            const distance = ray.size * Math.cos(ca);
            
            let lineHeight = Math.floor((this.map.tileSize * this.resolution.height) / distance);

            if (lineHeight > this.resolution.height) {

                lineHeight = this.resolution.height;
            }

            const x = index * lineWidth;
            const lineOffsetY = Math.floor(halfVerticalRes - lineHeight / 2);
            
            let color = new Color(100, 100, 100);
            if (!ray.hitVerticalFirst) color = Color.shade(color, 0.6);

            this.renderer.drawRect(x, lineOffsetY, lineWidth, lineHeight, color);
        }
    }

    public draw(): void {

        this.renderer.clear(this.BG_COLOR);
        this.drawSkybox();
        this.drawRays();
    }
}
