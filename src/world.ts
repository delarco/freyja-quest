import { Color } from "./models/color";
import { Map } from "./models/map";
import { Player } from "./models/player";
import { Size } from "./models/size";
import { RayCaster } from "./ray-caster";
import { IRenderer } from "./renderer/renderer";

export class World {

    private BG_COLOR = new Color(200, 200, 200);

    constructor(
        private renderer: IRenderer,
        private resolution: Size,
        private map: Map,
        private player: Player,
        private rayCaster: RayCaster) {}

    public drawRays(): void {

        const halfVerticalRes = this.resolution.height / 2;
        const lineWidth = this.resolution.width / this.rayCaster.rays.length;

        for (let index = 0; index < this.rayCaster.rays.length; index++) {

            const ray = this.rayCaster.rays[index];

            if(!ray.collidedTile) continue;

            const distance = ray.size;
            
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
        this.drawRays();
    }
}
