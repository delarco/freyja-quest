export class Point {

    constructor(public x: number = 0, public y: number = 0) { }

    public clone(): Point {

        return new Point(this.x, this.y);
    }

    public static distance(p1: Point, p2: Point): number {

        return Math.sqrt(
            (p2.x - p1.x) * (p2.x - p1.x)
            +
            (p2.y - p1.y) * (p2.y - p1.y)
        );
    }

    public distance(p: Point): number {

        return Point.distance(this, p);
    }
}
