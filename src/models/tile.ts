import { Color } from "./color";
import { Point } from "./point";

export class Tile {

    public minimapColor: Color;
    public collision: boolean;
    public index: Point;
    public position: Point;

    constructor() {
        
        this.minimapColor = Color.RED;
        this.collision = true;
        this.index = new Point();
        this.position = new Point();
    }
}
