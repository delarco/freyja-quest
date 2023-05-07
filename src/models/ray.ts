import { MathUtils } from "../utils/math-utils";
import { Point } from "./point";

export class Ray {

    public source: Point;
    public destination: Point;
    private _angle: number;

    public get angle() { return this._angle; }
    public set angle(a: number) { this._angle = MathUtils.fixAngle(a); }

    constructor() {
        
        this.source = new Point();
        this.destination = new Point();
        this._angle = 0;
    }
}
