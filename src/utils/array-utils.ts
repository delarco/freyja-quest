export class ArrayUtils {

    public static range(size: number): Array<number> {

        return [...new Array(size).keys()];
    }
}
