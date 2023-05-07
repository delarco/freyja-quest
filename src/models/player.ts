import { Point } from "./point";

export class Player {

    /**
     * Player position
     */
    public position: Point;

    /**
     * Player angle in radians
     */
    public angle: number;

    constructor(position: Point = new Point(0, 0), angle: number = 0) {

        this.position = position;
        this.angle = angle;
    }
}
