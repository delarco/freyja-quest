import { AssetsManager } from "./assets-manager";
import { Color } from "./models/color";
import { Map } from "./models/map";
import { Player } from "./models/player";
import { Point } from "./models/point";
import { Direction, Ray } from "./models/ray";
import { Size } from "./models/size";
import { Texture } from "./models/texture";
import { RayCaster } from "./ray-caster";
import { IRenderer } from "./renderer/renderer";
import { ArrayUtils } from "./utils/array-utils";
import { MathUtils } from "./utils/math-utils";

export class World {

    constructor(
        private renderer: IRenderer,
        private resolution: Size,
        private map: Map,
        private player: Player,
        private rayCaster: RayCaster,
        private halfVerticalRes: number = resolution.height / 2
    ) { }

    public drawSkybox(ray: Ray, wallStartY: number): void {

        const x = ray.index;
        const tx = Math.floor(MathUtils.radiansToDegrees(ray.angle));
        const yScale = this.map.skyboxTexture.size.height / (this.resolution.height / 2);
        const lastY = Math.min(wallStartY, this.halfVerticalRes);

        for (let y of ArrayUtils.range(lastY)) {

            const ty = Math.floor(y * yScale);
            const color = this.map.skyboxTexture.getPixelColor(tx, ty);
            this.renderer.drawPixel(x, y, color);
        }
    }

    public drawFloorCeiling(ray: Ray, wallStartY: number, wallHeight: number): void {

        const sin = Math.sin(ray.angle);
        const cos = Math.cos(ray.angle);
        const cosEyeFish = Math.cos(ray.angleFishEyeFix);

        for (let j of ArrayUtils.range(this.halfVerticalRes)) {

            const n = (this.halfVerticalRes / (this.halfVerticalRes - j)) / cosEyeFish;
            const x = this.player.position.x / this.map.tileSize + cos * n;
            const y = this.player.position.y / this.map.tileSize - sin * n;

            if (
                x < 0
                || y < 0
                || x > this.map.size.width
                || y > this.map.size.height
            ) continue;

            const pixelX = ray.index;
            const pixelY = this.halfVerticalRes * 2 - j - 1;

            const tile = this.map.getTile(Math.floor(x), Math.floor(y));
            let floorTexure = tile?.floorTexture;
            let ceilingTexture = tile?.ceilingTexture;

            const shade = 0.2 + 0.8 * (1 - j / this.halfVerticalRes);

            if (floorTexure && pixelY >= wallStartY + wallHeight) {

                let tx = Math.floor(x % 1 * (floorTexure.size.width - 1));
                let ty = Math.floor(y % 1 * (floorTexure.size.height - 1));

                if (tx < 0) tx = floorTexure.size.width + tx - 1;
                if (ty < 0) ty = floorTexure.size.height + ty - 1;

                const color = Color.shade(floorTexure.getPixelColor(tx, ty), shade);
                this.renderer.drawPixel(pixelX, pixelY, color);
            }

            if (ceilingTexture && this.resolution.height - pixelY < wallStartY) {

                let tx = Math.floor(x % 1 * (ceilingTexture.size.width - 1));
                let ty = Math.floor(y % 1 * (ceilingTexture.size.height - 1));

                if (tx < 0) tx = ceilingTexture.size.width + tx - 1;
                if (ty < 0) ty = ceilingTexture.size.height + ty - 1;

                const color = Color.shade(ceilingTexture.getPixelColor(tx, ty), shade);
                this.renderer.drawPixel(pixelX, this.resolution.height - pixelY, color);
            }
        }
    }

    public drawRays(): void {

        const lineWidth = this.resolution.width / this.rayCaster.rays.length;

        for (let index = 0; index < this.rayCaster.rays.length; index++) {

            const ray = this.rayCaster.rays[index];

            if (!ray.collidedTile) continue;

            const texture = ray.collidedTile.wallTexture[ray.collisionDirection] || AssetsManager.DEBUG_TEXTURE;
            const textureDetail = ray.collidedTile.wallDetailsTexture[ray.collisionDirection];
            const ca = MathUtils.fixAngle(this.player.angle - ray.angle);
            const distance = ray.size * Math.cos(ca);

            const lineHeight = Math.floor((this.map.tileSize * this.resolution.height) / distance);
            let lineDrawHeight = lineHeight;

            const textureStepY = texture.size.height / lineHeight;
            const textureDetailStepY = textureDetail?.size.height / lineHeight || 0;

            if (lineHeight > this.resolution.height) {

                lineDrawHeight = this.resolution.height;
            }

            const x = index * lineWidth;
            const lineOffsetY = Math.floor(this.halfVerticalRes - lineDrawHeight / 2);

            this.drawSkybox(ray, lineOffsetY);
            this.drawFloorCeiling(ray, lineOffsetY, lineDrawHeight);

            const hitVerticalFirst = ray.collisionDirection == Direction.EAST || ray.collisionDirection == Direction.WEST;

            const textureCoords = this.getTextureCoords(ray, lineHeight, textureStepY, hitVerticalFirst, texture);
            const textureDetailCoords = this.getTextureCoords(ray, lineHeight, textureDetailStepY, hitVerticalFirst, textureDetail);

            if (!textureCoords && !textureDetailCoords) continue;

            for (let y = lineOffsetY; y < lineOffsetY + lineDrawHeight; y++) {

                let color: Color | null = null;

                if (textureDetail && textureDetailCoords) {

                    let roundTextureDetailY = Math.floor(textureDetailCoords.y)
                    if (roundTextureDetailY > textureDetail.size.height - 1) roundTextureDetailY = textureDetail.size.height - 1;

                    color = textureDetail.getPixelColor(textureDetailCoords.x, roundTextureDetailY) || Color.WHITE;

                    if (color.a == 0) color = null;
                }

                if (color == null && textureCoords) {

                    let roundTextureY = Math.floor(textureCoords.y)
                    if (roundTextureY > texture.size.height - 1) roundTextureY = texture.size.height - 1;

                    color = texture.getPixelColor(textureCoords.x, roundTextureY) || Color.WHITE;
                }

                if (color) {

                    // TODO: move shade params to map JSON

                    // direction shade
                    if (!hitVerticalFirst) color = Color.shade(color, 0.6);

                    // distance shade
                    const shade = 0.2 + 0.8 * (1 - distance / this.halfVerticalRes);
                    color = Color.shade(color, shade);

                    if (textureCoords) textureCoords.y += textureStepY;
                    if (textureDetailCoords) textureDetailCoords.y += textureDetailStepY;

                    this.renderer.drawHorizontalLine(x, x + lineWidth - 1, y, color);
                }
            }
        }
    }

    private getTextureCoords(ray: Ray, lineHeight: number, textureStepY: number, hitVerticalFirst: boolean, texture: Texture): Point | null {

        if (!texture) return null;

        let textureOffsetY = 0;

        if (lineHeight > this.resolution.height) {

            textureOffsetY = (lineHeight - this.resolution.height) / 2;
        }

        let textureY = textureOffsetY * textureStepY;
        let textureX = 0;

        if (!hitVerticalFirst) {

            const tileSizeOverTexWidth = this.map.tileSize / texture.size.width;

            textureX = (ray.destination.x / tileSizeOverTexWidth) % texture.size.width;
            if (ray.angle > MathUtils.rad180) textureX = texture.size.width - textureX;
        }

        if (hitVerticalFirst) {

            const tileOverTexWidth = this.map.tileSize / texture.size.width;

            textureX = (ray.destination.y / tileOverTexWidth) % texture.size.width;
            if (ray.angle > MathUtils.rad90 && ray.angle < MathUtils.rad270) textureX = texture.size.width - textureX;
        }

        const roundTextureX = Math.floor(textureX);

        return new Point(roundTextureX, textureY);
    }

    public draw(): void {

        this.renderer.clear(Color.WHITE);
        this.drawRays();
        this.renderer.swapBuffer();
    }
}
