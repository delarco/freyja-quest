import { Point } from "../models/point";

export class ClickEvent {

    constructor(public point: Point, public button: number) { }
}
