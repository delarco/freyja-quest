import { Size } from "./size";

export class Map {

    public readonly size: Size;
    public readonly tiles: Array<number>;

    constructor(width: number, height: number) {

        this.size = new Size(width, height);
        this.tiles = new Array<number>(width * height);

        for(let y = 0; y < this.size.height; y++) {
            for(let x = 0; x < this.size.width; x++) {

                this.tiles[y * this.size.width + x] = (
                    x == 0
                    || y == 0
                    || (x == this.size.width - 1)
                    || (y == this.size.height - 1)
                    || (x == 1 && y == 1)
                ) ? 1 : 0
            }
        }        
    }
}
