import { Color } from "./models/color";
import { Map } from "./models/map";
import { Size } from "./models/size";
import { IRenderer } from "./renderer/renderer";

export class Minimap {

    private BG_COLOR = new Color(221, 221, 221);

    constructor(private map: Map, private renderer: IRenderer, private resolution: Size) { }

    public draw(): void {

        const tileWidth = this.resolution.width / this.map.size.width;
        const tileHeight = this.resolution.width / this.map.size.width;

        this.renderer.clear(this.BG_COLOR);

        for (let y = 0; y < this.map.size.height; y++) {
            for (let x = 0; x < this.map.size.width; x++) {

                const color =
                    this.map.tiles[y * this.map.size.width + x] > 0
                        ? new Color(170, 170, 170)
                        : this.BG_COLOR;

                this.renderer.drawRect(
                    x * tileWidth + 1,
                    y * tileHeight + 1,
                    tileWidth - 2,
                    tileHeight - 2,
                    color
                )
            }
        }
    }
}
