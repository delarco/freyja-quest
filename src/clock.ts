export class Clock {

    private lastUpdateTime: number;
    private readonly updateRequiredElapsed = 1000 / 20;

    private lastFrameTime: number;
    private fpsCounter: number;

    public fps: number;

    constructor() {

        this.lastUpdateTime = Date.now();
        this.lastFrameTime = Date.now();
        this.fpsCounter = 0;
        this.fps = 0;
    }

    /**
     * Updates FPS and returns true if game entities should update
     */
    public tick(): boolean {

        this.fpsCounter++;

        const now = Date.now();

        if (now - this.lastFrameTime > 1000) {

            this.lastFrameTime = now;
            this.fps = this.fpsCounter;
            this.fpsCounter = 0;
        }

        if (now - this.lastUpdateTime > this.updateRequiredElapsed) {

            this.lastUpdateTime = now;
            return true;
        }
        else {

            return false;
        }
    }
}