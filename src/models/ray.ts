import { MathUtils } from "../utils/math-utils";
import { Point } from "./point";
import { Tile } from "./tile";

export enum Direction {
    NONE = 0,
    NORTH = 1,
    SOUTH = 2,
    EAST = 3,
    WEST = 4,
}

export class Ray {

    public readonly index;
    public source: Point;
    public destination: Point;
    public size: number;
    public collidedTile: Tile | null;
    private _angle: number;
    private _angleFishEyeFix: number;

    public collisionDirection: Direction;

    public get angle() { return this._angle; }
    public set angle(a: number) { this._angle = MathUtils.fixAngle(a); }

    public get angleFishEyeFix() { return this._angleFishEyeFix; }
    public set angleFishEyeFix(a: number) { this._angleFishEyeFix = MathUtils.fixAngle(a); }

    public get deltaX() { return this.source.x - this.destination.x }
    public get deltaY() { return this.source.y - this.destination.y }

    constructor(index: number) {

        this.index = index;
        this.source = new Point();
        this.destination = new Point();
        this.size = 0;
        this.collidedTile = null;
        this._angle = 0;
        this._angleFishEyeFix = 0;
        this.collisionDirection = Direction.NONE;
    }
}
