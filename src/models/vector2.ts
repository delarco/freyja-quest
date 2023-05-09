export class Vector2 {

    constructor(public x: number, public y: number) { }

    public static make(x: number, y: number): Vector2 {

        return new Vector2(x, y);
    }
}
