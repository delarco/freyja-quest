export class MathUtils {

    private static rad360 = Math.PI * 2;

    /**
     * Returnas the angle between 0 and 2*PI (360)
     * @param x A numeric expression that contains an angle measured in radians.
     */
    public static fixAngle(angle: number): number {

        if (angle < 0) return this.rad360 + angle;
        if (angle > this.rad360) return angle - this.rad360;
        return angle;
    }
}
