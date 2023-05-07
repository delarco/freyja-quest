import { Color } from "./models/color";
import { Map } from "./models/map";
import { Player } from "./models/player";
import { Size } from "./models/size";
import { IRenderer } from "./renderer/renderer";

export class Minimap {

    private BG_COLOR = new Color(200, 200, 200);

    private minimapTileSize: Size;

    constructor(private map: Map, private player: Player, private renderer: IRenderer, private resolution: Size, private tileSize: number) {

        // calculate tile size in minimap
        this.minimapTileSize = new Size(
            this.resolution.width / this.map.size.width,
            this.resolution.width / this.map.size.width
        );
    }

    private drawMap(): void {

        for (let y = 0; y < this.map.size.height; y++) {
            for (let x = 0; x < this.map.size.width; x++) {

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
        const x = this.minimapTileSize.width / this.tileSize * this.player.position.x;
        const y = this.minimapTileSize.height / this.tileSize * this.player.position.y;

        // draw angle indicator
        this.renderer.drawLine(
            x,
            y,
            x + Math.cos(this.player.angle) * 6,
            y + Math.sin(this.player.angle) * 6,
            1,
            Color.BLUE
        );

        // draw player
        this.renderer.drawCircle(x, y, 2, Color.RED, Color.ORANGE);
    }

    public draw(): void {

        this.renderer.clear(this.BG_COLOR);
        this.drawMap();
        this.drawPlayer();
    }
}
