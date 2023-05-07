import { Color } from "./models/color";
import { Map } from "./models/map";
import { Player } from "./models/player";
import { Point } from "./models/point";
import { Ray } from "./models/ray";
import { Size } from "./models/size";
import { Texture } from "./models/texture";
import { RayCaster } from "./ray-caster";
import { IRenderer } from "./renderer/renderer";
import { ArrayUtils } from "./utils/array-utils";
import { MathUtils } from "./utils/math-utils";

export class World {

    private skyboxTexture: Texture;

    constructor(
        private renderer: IRenderer,
        private resolution: Size,
        private map: Map,
        private player: Player,
        private rayCaster: RayCaster) {

        this.skyboxTexture = Texture.makeSkyBox(this.resolution.height / 2);
    }

    public drawSkybox(ray: Ray): void {

        const x = ray.index;
        const tx = Math.floor(MathUtils.radiansToDegrees(ray.angle));

        for (let y of ArrayUtils.range(this.resolution.height / 2)) {

            const ty = y;
            const color = this.skyboxTexture.getPixelColor(tx, ty);
            this.renderer.drawPixel(x, y, color);
        }
    }

    public drawFloor(ray: Ray): void {

        const halfVerticalRes = this.resolution.height / 2;

        const sin = Math.sin(ray.angle);
        const cos = Math.cos(ray.angle);
        const cosEyeFish = Math.cos(ray.angleFishEyeFix);

        for (let j of ArrayUtils.range(halfVerticalRes)) {

            const n = (halfVerticalRes / (halfVerticalRes - j)) / cosEyeFish;
            const x = this.player.position.x / this.map.tileSize + cos * n;
            const y = this.player.position.y / this.map.tileSize - sin * n;

            const pixelX = ray.index;
            const pixelY = halfVerticalRes * 2 - j - 1;

            const tile = this.map.getTileFromPosition(new Point(x, y));
            let tex = tile?.floor;

            if(!tex) tex = Texture.EMPTY;

            let tx = Math.floor(x * 2 % 1 * (tex.size.width - 1));
            let ty = Math.floor(y * 2 % 1 * (tex.size.height - 1));

            if (tx < 0) tx = tex.size.width + tx - 1;
            if (ty < 0) ty = tex.size.height + ty - 1;

            const shade = 0.2 + 0.8 * (1 - j / halfVerticalRes);
            const color = Color.shade(tex.getPixelColor(tx, ty), shade);

            this.renderer.drawPixel(pixelX, pixelY, color);
        }
    }

    public drawRays(): void {

        const halfVerticalRes = this.resolution.height / 2;
        const lineWidth = this.resolution.width / this.rayCaster.rays.length;

        for (let index = 0; index < this.rayCaster.rays.length; index++) {

            const ray = this.rayCaster.rays[index];

            this.drawSkybox(ray);
            this.drawFloor(ray);

            if (!ray.collidedTile) continue;

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

            const shade = 0.2 + 0.8 * (1 - distance / halfVerticalRes);
            color = Color.shade(color, shade);

            this.renderer.drawRect(x, lineOffsetY, lineWidth, lineHeight, color);
        }
    }

    public draw(): void {

        this.drawRays();
        this.renderer.swapBuffer();
    }
}
