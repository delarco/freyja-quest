import { Point } from "../models/point";
import { Vector2 } from "../models/vector2";
import { IRenderer } from "../renderer/renderer";

export interface Scene {

    renderer: IRenderer;

    initialize(): void;

    update(): void;

    mouseMovement(mov: Vector2): void;

    mouseClick(point: Point, button: number): void;

    draw(): void;

    dispose(): void;
}
