import { Color } from "./color";
import { Point } from "./point";
import { Texture } from "./texture";

export class Tile {

    constructor(
        public minimapColor: Color = Color.RED,
        public collision: boolean = true,
        public index: Point = new Point(),
        public position: Point = new Point(),
        public floorTexture: Texture = Texture.EMPTY,
        public floor: string = '',
        public wallTexture: { [key: number]: Texture } = {},
        public wall: { [key: number]: string } = {},
        public ceilingTexture: Texture | null = null,
        public ceiling: string = '',
    ) { }
}
