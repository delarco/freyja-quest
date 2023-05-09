import { TypedEvent } from "../typed-event";

export enum AudioType {
    MUSIC,
    SOUND_EFFECT
}

export class Audio {

    public onPlayEnded = new TypedEvent<void>;

    constructor(public filename: string, public type: AudioType, private audioElement: HTMLAudioElement) {

        this.audioElement.onended = () => this.onPlayEnded.emit();
    }

    public set volume(v: number) {

        this.audioElement.volume = v;
    }

    public set loop(loop: boolean) {

        this.audioElement.loop = loop;
    }

    public get duration() {

        return this.audioElement.duration;
    }

    public play(): void {

        this.audioElement.play();
    }
}
