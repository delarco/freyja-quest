import { Color } from "./color";
import { Point } from "./point";
import { Texture } from "./texture";

export class Tile {

    public minimapColor: Color;
    public collision: boolean;
    public index: Point;
    public position: Point;
    public floor: Texture;
    public wall: Texture | string;

    constructor() {
        
        this.minimapColor = Color.RED;
        this.collision = true;
        this.index = new Point();
        this.position = new Point();
        this.floor = Texture.EMPTY;
        this.wall = Texture.EMPTY;
    }
}
