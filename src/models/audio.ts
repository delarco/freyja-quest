export enum AudioType {
    MUSIC
}

export class Audio {

    constructor(public filename: string, public type: AudioType, private audioElement: HTMLAudioElement) {}

    public set volume(v: number) {

        this.audioElement.volume = v;
    }

    public play(): void {

        this.audioElement.play();
    }
}
