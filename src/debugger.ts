import { Clock } from "./utils/clock";
import { Map } from "./models/map";
import { Player } from "./models/player";

export class Debugger {

    private static debuggerPanel: HTMLDivElement = document.querySelector<HTMLDivElement>('#debugger')!;
    private static fpsInfo: HTMLSpanElement = document.querySelector<HTMLDivElement>('#debug-fps')!;
    private static playerInfo: HTMLSpanElement = document.querySelector<HTMLDivElement>('#debug-player')!;

    private static _clock: Clock;
    private static _map: Map;
    private static _player: Player;

    public static set clock(clock: Clock) { Debugger._clock = clock; }
    public static set map(map: Map) { Debugger._map = map; }
    public static set player(player: Player) { Debugger._player = player; }

    public static firstFrame: boolean = true;
    private static active: boolean = false;

    public static update(): void {

        if (!this.active) return;

        this.fpsInfo.innerText = this._clock?.fps.toString();

        const playerTile = this._map.getTileFromPosition(this._player.position);

        this.playerInfo.innerText = `
        x: ${this._player.position.x.toFixed(2)} 
        y: ${this._player.position.y.toFixed(2)} 
        a: ${this._player.angle.toFixed(2)} cos: ${Math.cos(this._player.angle).toFixed(3)} sin: ${Math.sin(this._player.angle).toFixed(3)}
        tile: ${playerTile?.index.x} ${playerTile?.index.y}
        `;
    }

    public static toggle(active: boolean): void {

        this.active = active;

        this.debuggerPanel.className = this.active
            ? this.debuggerPanel.className += ' active'
            : this.debuggerPanel.className = this.debuggerPanel.className.replace('active', '');
    }
}
