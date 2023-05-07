import { Color } from "./models/color";
import { Map } from "./models/map";
import { Player } from "./models/player";
import { Size } from "./models/size";
import { RayCaster } from "./ray-caster";
import { IRenderer } from "./renderer/renderer";
import { ArrayUtils } from "./utils/array-utils";

export class Minimap {

    private BG_COLOR = new Color(200, 200, 200);

    private minimapTileSize: Size;

    constructor(
        private renderer: IRenderer,
        private resolution: Size,
        private map: Map,
        private player: Player,
        private rayCaster: RayCaster) {

        // calculate tile size in minimap
        this.minimapTileSize = new Size(
            this.resolution.width / this.map.size.width,
            this.resolution.width / this.map.size.width
        );
    }

    private drawMap(): void {

        for (let y of ArrayUtils.range(this.map.size.height)) {
            for (let x of ArrayUtils.range(this.map.size.width)) {

                const tile = this.map.tiles[y * this.map.size.width + x];

                this.renderer.drawRect(
                    x * this.minimapTileSize.width + 1,
                    y * this.minimapTileSize.height + 1,
                    this.minimapTileSize.width - 2,
                    this.minimapTileSize.height - 2,
                    tile.minimapColor
                )
            }
        }
    }

    private drawPlayer(): void {

        // convert player position to minimap coordinates
        const x = this.minimapTileSize.width / this.map.tileSize * this.player.position.x;
        const y = this.minimapTileSize.height / this.map.tileSize * this.player.position.y;

        // draw angle indicator
        this.renderer.drawLine(
            x,
            y,
            x + Math.cos(-this.player.angle) * 6,
            y + Math.sin(-this.player.angle) * 6,
            1,
            Color.BLUE
        );

        // draw player
        this.renderer.drawCircle(x, y, 2, Color.RED, Color.ORANGE);
    }

    private drawRays(): void {

        for (let ray of this.rayCaster.rays) {

            // convert ray source to minimap coordinates
            const sx = this.minimapTileSize.width / this.map.tileSize * ray.source.x;
            const sy = this.minimapTileSize.height / this.map.tileSize * ray.source.y;

            // convert ray destination to minimap coordinates
            const dx = this.minimapTileSize.width / this.map.tileSize * ray.destination.x;
            const dy = this.minimapTileSize.height / this.map.tileSize * ray.destination.y;

            this.renderer.drawLine(sx, sy, dx, dy, 1, Color.GREEN);
        }
    }

    public draw(): void {

        this.renderer.clear(this.BG_COLOR);
        this.drawMap();
        this.drawRays();
        this.drawPlayer();
    }
}
