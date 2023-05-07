import { Point } from "./models/point";
import { Ray } from "./models/ray";
import { ArrayUtils } from "./utils/array-utils";

export class RayCaster {

    private VIEW_ANGLE = Math.PI / 3; // 60deg

    public rays: Array<Ray>;

    constructor(private totalRays: number) {

        this.rays = [...Array(totalRays).keys()].map(() => new Ray());
    }

    public cast(source: Point, angle: number): void {

        const angleStep = this.VIEW_ANGLE / (this.totalRays - 1);

        for(let rayIndex of ArrayUtils.range(this.totalRays)) {

            let ray = this.rays[rayIndex];
            ray.angle = angle + (this.VIEW_ANGLE / 2) - rayIndex * angleStep;
            ray.source = source;

            ray.destination = new Point(
                ray.source.x + Math.cos(ray.angle) * 100,
                ray.source.y + Math.sin(ray.angle) * 100
            );
        }
    }
}
