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

        // TODO: draw only before wall
        const x = ray.index;
        const tx = Math.floor(MathUtils.radiansToDegrees(ray.angle));

        for (let y of ArrayUtils.range(this.resolution.height / 2)) {

            const ty = y;
            const color = this.skyboxTexture.getPixelColor(tx, ty);
            this.renderer.drawPixel(x, y, color);
        }
    }

    public drawFloor(ray: Ray): void {

        // TODO: draw only after wall
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

            if (!tex) continue;

            let tx = Math.floor(x % 1 * (tex.size.width - 1));
            let ty = Math.floor(y % 1 * (tex.size.height - 1));

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

            const texture = ray.collidedTile.wall;
            const ca = MathUtils.fixAngle(this.player.angle - ray.angle);
            const distance = ray.size * Math.cos(ca);

            let lineHeight = Math.floor((this.map.tileSize * this.resolution.height) / distance);
            let textureStepY = texture.size.height / lineHeight;
            let textureOffsetY = 0;

            if (lineHeight > this.resolution.height) {

                textureOffsetY = (lineHeight - this.resolution.height) / 2;
                lineHeight = this.resolution.height;
            }

            const x = index * lineWidth;
            const lineOffsetY = Math.floor(halfVerticalRes - lineHeight / 2);

            let textureY = textureOffsetY * textureStepY;
            let textureX = 0;

            if (!ray.hitVerticalFirst) {

                const tileSizeOverTexWidth = this.map.tileSize / texture.size.width;

                textureX = (ray.destination.x / tileSizeOverTexWidth) % texture.size.width;
                if (ray.angle > MathUtils.rad180) textureX = texture.size.width - textureX;
            }

            if (ray.hitVerticalFirst) {

                const tileOverTexWidth = this.map.tileSize / texture.size.width;

                textureX = (ray.destination.y / tileOverTexWidth) % texture.size.width;
                if (ray.angle > MathUtils.rad90 && ray.angle < MathUtils.rad270) textureX = texture.size.width - textureX;
            }

            const roundTextureX = Math.floor(textureX);

            for (let y = lineOffsetY; y < lineOffsetY + lineHeight; y++) {

                let roundTextureY = Math.floor(textureY)
                if (roundTextureY > texture.size.height - 1) roundTextureY = texture.size.height - 1;

                let color = texture.getPixelColor(roundTextureX, roundTextureY) || Color.WHITE;
                if (!ray.hitVerticalFirst) color = Color.shade(color, 0.6);

                const shade = 0.2 + 0.8 * (1 - distance / halfVerticalRes);
                color = Color.shade(color, shade);

                textureY += textureStepY;

                for (let offsetX = 0; offsetX < lineWidth; offsetX++)
                    this.renderer.drawPixel(x + offsetX, y, color);
            }

        }
    }

    public draw(): void {

        this.drawRays();
        this.renderer.swapBuffer();
    }
}
