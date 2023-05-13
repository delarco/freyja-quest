import { Map } from "./models/map";
import { Point } from "./models/point";
import { Direction, Ray } from "./models/ray";
import { Tile } from "./models/tile";
import { ArrayUtils } from "./utils/array-utils";
import { MathUtils } from "./utils/math-utils";

export class RayCaster {

    private VIEW_ANGLE = MathUtils.rad60;

    public rays: Array<Ray>;

    public angleStep: number;

    constructor(private totalRays: number, private map: Map) {

        this.rays = [...Array(totalRays).keys()].map((index) => new Ray(index));
        this.angleStep = this.VIEW_ANGLE / (this.totalRays - 1);
    }

    /**
     * Calculate collision and size for each ray
     * @param source Ray start position
     * @param angle Middle angle
     */
    public cast(source: Point, angle: number): void {

        const maxDistance = this.map.worldSize.width * this.map.worldSize.height * 100;

        for (let rayIndex of ArrayUtils.range(this.totalRays)) {

            let ray = this.rays[rayIndex];
            ray.angle = MathUtils.fixAngle(angle + (this.VIEW_ANGLE / 2) - rayIndex * this.angleStep);
            ray.angleFishEyeFix = MathUtils.fixAngle((this.VIEW_ANGLE / 2) - rayIndex * this.angleStep);
            ray.source = source.clone();

            const sourceTile = this.map.getTileFromPosition(ray.source)!;

            const horizontalPoint = this.checkHorizontal(ray, sourceTile);
            const horizontalDistance = horizontalPoint ? ray.source.distance(horizontalPoint) : maxDistance;

            const verticalPoint = this.checkVertical(ray, sourceTile);
            const verticalDistance = verticalPoint ? ray.source.distance(verticalPoint) : maxDistance;

            if (horizontalDistance < verticalDistance) {
                ray.destination = horizontalPoint!;
                ray.size = horizontalDistance;

                if(ray.angle > 0 && ray.angle < MathUtils.rad180) {
                    ray.collisionDirection = Direction.SOUTH
                }
                else {
                    ray.collisionDirection = Direction.NORTH;
                }
            }
            else if (verticalDistance < horizontalDistance) {
                ray.destination = verticalPoint!;
                ray.size = verticalDistance;

                if(ray.angle < MathUtils.rad90 || ray.angle > MathUtils.rad270) {
                    ray.collisionDirection = Direction.WEST
                }
                else {
                    ray.collisionDirection = Direction.EAST;
                }
            }

            ray.collidedTile = this.map.getTileFromPosition(ray.destination);
        }
    }

    /**
     * Returns the first horizontal collision point
     * @param ray 
     * @param sourceTile 
     */
    private checkHorizontal(ray: Ray, sourceTile: Tile): Point | null {

        const aTan = -1 / Math.tan(ray.angle);
        const offset = new Point();
        let walkCount = 0;

        // looking up
        if (ray.angle < MathUtils.rad180) {

            // y is the start of tile
            ray.destination.y = sourceTile.position.y - 0.01;

            // x / y = tan(a)
            ray.destination.x = ray.source.x - (ray.deltaY * aTan);

            // walk -1 tile-size
            offset.y = -this.map.tileSize;

            // walk proportionaly
            offset.x = -this.map.tileSize * aTan;
        }

        // looking down
        else if (ray.angle > MathUtils.rad180) {

            // y is the end of tile
            ray.destination.y = sourceTile.position.y + this.map.tileSize + 0.01;

            // x / y = tan(a)
            ray.destination.x = ray.source.x - (ray.deltaY * aTan);

            // walk 1 tile-size
            offset.y = this.map.tileSize;

            // walk proportionaly
            offset.x = this.map.tileSize * aTan;
        }

        // looking straight left or right
        else if (ray.angle == 0 || ray.angle == MathUtils.rad180) {

            ray.destination = ray.source.clone();
            walkCount = this.map.worldSize.width;
        }

        while (walkCount < this.map.worldSize.width) {

            const rayTile = this.map.getTileFromPosition(ray.destination);

            if (rayTile && rayTile.collision === true) {

                return ray.destination.clone();
            }
            else {

                ray.destination.x += offset.x;
                ray.destination.y += offset.y;
                walkCount++;
            }
        }

        return null;
    }

    /**
     * Returns the first vertical collision point
     * @param ray 
     * @param sourceTile 
     */
    private checkVertical(ray: Ray, sourceTile: Tile): Point | null {

        const nTan = -Math.tan(ray.angle);
        const offset = new Point();
        let walkCount = 0;

        // looking left
        if (ray.angle > MathUtils.rad90 && ray.angle < MathUtils.rad270) {

            // x is the start of tile
            ray.destination.x = sourceTile.position.x - 0.01;

            // x / y = tan(a)
            ray.destination.y = ray.source.y - (ray.deltaX * nTan);

            // walk -1 tile-size
            offset.x = -this.map.tileSize;

            // walk proportionaly
            offset.y = -this.map.tileSize * nTan;
        }

        // looking right
        else if (ray.angle < MathUtils.rad90 || ray.angle > MathUtils.rad270) {

            // y is the end of tile
            ray.destination.x = sourceTile.position.x + this.map.tileSize + 0.01;

            // x / y = tan(a)
            ray.destination.y = ray.source.y - (ray.deltaX * nTan)

            // walk -1 tile-size
            offset.x = this.map.tileSize;

            // walk proportionaly
            offset.y = this.map.tileSize * nTan;
        }

        // looking straight up or down
        else if (ray.angle == MathUtils.rad90 || ray.angle == MathUtils.rad270) {

            ray.destination = ray.source.clone();
            walkCount = this.map.worldSize.height;
        }

        while (walkCount < this.map.worldSize.height) {

            const rayTile = this.map.getTileFromPosition(ray.destination);

            if (rayTile && rayTile.collision === true) {

                return ray.destination.clone();
            }
            else {

                ray.destination.x += offset.x;
                ray.destination.y += offset.y;
                walkCount++;
            }
        }

        return null;
    }
}
