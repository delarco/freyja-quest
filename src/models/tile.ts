import { Color } from "./color";
import { Point } from "./point";
import { Texture } from "./texture";

export class Tile {

    public minimapColor: Color;
    public collision: boolean;
    public index: Point;
    public position: Point;
    public floorTexture: Texture;
    public floor: string;
    public wallTexture: Texture;
    public wall: string;
    public ceilingTexture: Texture;
    public ceiling: string;

    constructor() {
        
        this.minimapColor = Color.RED;
        this.collision = true;
        this.index = new Point();
        this.position = new Point();
        this.floorTexture = Texture.EMPTY;
        this.floor = '';
        this.wallTexture = Texture.EMPTY;
        this.wall = '';
        this.ceilingTexture = Texture.EMPTY;
        this.ceiling = '';
    }
}
