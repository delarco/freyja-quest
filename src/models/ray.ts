import { MathUtils } from "../utils/math-utils";
import { Point } from "./point";
import { Tile } from "./tile";

export class Ray {

    public readonly index;
    public source: Point;
    public destination: Point;
    private _angle: number;
    public size: number;
    public collidedTile: Tile | null;
    public hitVerticalFirst: boolean;

    public get angle() { return this._angle; }
    public set angle(a: number) { this._angle = MathUtils.fixAngle(a); }

    public get deltaX() { return this.source.x - this.destination.x }
    public get deltaY() { return this.source.y - this.destination.y }

    constructor(index: number) {

        this.index = index;
        this.source = new Point();
        this.destination = new Point();
        this._angle = 0;
        this.size = 0;
        this.collidedTile = null;
        this.hitVerticalFirst = false;
    }
}
