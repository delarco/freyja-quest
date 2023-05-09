import { Game } from "./game";
import { GUI } from "./gui";

export class App {

    private userInterface: GUI;
    private game: Game;

    constructor() {

        this.userInterface = new GUI();
        this.game = new Game();
    }

    /**
     * Initialize user interface and game.
     */
    public async start(): Promise<void> {

        this.userInterface.initialize();
        this.userInterface.onKeyDown.on(key => this.game.keyState[key] = true);
        this.userInterface.onKeyUp.on(key => this.game.keyState[key] = false);
        this.userInterface.onMouseMove?.on(vec => this.game.mouseMovement(vec));

        await this.game.initialize(
            this.userInterface.minimapCanvas,
            this.userInterface.worldCanvas
        );
        this.game.run();
    }
}
