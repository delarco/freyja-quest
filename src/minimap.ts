import { Size } from "./models/size";
import { IRenderer } from "./renderer/renderer";

export class Minimap {

    constructor(private renderer: IRenderer, private resolution: Size) { }

    public draw(): void {

        this.renderer.clear('#FAA');
        this.renderer.drawLine(0, 0, 50, 50, 1, '#AFA');
        this.renderer.drawLine(50, 50, 100, 100, 1, '#AAF');
        this.renderer.drawLine(100, 0, 50, 50, 1, '#AAA');
        this.renderer.drawLine(0, 100, 50, 50, 1, '#AFF');
    }
}
