import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Track } from '../models/track.model';

export type RepeatMode = 'off' | 'one' | 'all';

export interface PlayerState {
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  queueIndex: number;
  shuffle: boolean;
  repeat: RepeatMode;
}

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audio = new Audio();
  private stateSubject = new BehaviorSubject<PlayerState>({
    currentTrack: null,
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    volume: 1,
    queue: [],
    queueIndex: -1,
    shuffle: false,
    repeat: 'off'
  });
  public state = this.stateSubject.asObservable();

  constructor() {
    this.audio.volume = 1;
    this.audio.addEventListener('ended', () => this.handleTrackEnd());
    this.audio.addEventListener('timeupdate', () => {
      this.updateState({ currentTime: this.audio.currentTime });
    });
    this.audio.addEventListener('loadedmetadata', () => {
      this.updateState({ duration: this.audio.duration });
    });
  }

  play(track: Track, queue?: Track[], index?: number) {
    let currentQueue = queue || this.stateSubject.value.queue;
    let queueIndex = typeof index === 'number' ? index : currentQueue.findIndex(t => t.id === track.id);

    if (queueIndex === -1) {
      currentQueue = [...currentQueue, track];
      queueIndex = currentQueue.length - 1;
    }

    this.audio.src = track.url;
    this.audio.load();
    this.audio.play();

    this.updateState({
      currentTrack: track,
      currentTime: 0,
      duration: this.audio.duration || 0,
      isPlaying: true,
      queue: currentQueue,
      queueIndex
    });
  }

  togglePlayPause() {
    if (this.audio.paused) {
      this.audio.play();
      this.updateState({ isPlaying: true });
    } else {
      this.audio.pause();
      this.updateState({ isPlaying: false });
    }
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.updateState({ isPlaying: false, currentTime: 0 });
  }

  seek(position: number) {
    this.audio.currentTime = position;
    this.updateState({ currentTime: position });
  }

  setVolume(value: number) {
    this.audio.volume = value;
    this.updateState({ volume: value });
  }

  next() {
    const state = this.stateSubject.value;
    let { queue, queueIndex, shuffle, repeat } = state;
    let nextIndex: number;

    if (shuffle) {
      // Pick a random next track different from the current
      if (queue.length > 1) {
        do {
          nextIndex = Math.floor(Math.random() * queue.length);
        } while (nextIndex === queueIndex);
      } else {
        nextIndex = 0;
      }
    } else {
      nextIndex = queueIndex + 1;
    }

    if (nextIndex < queue.length) {
      this.play(queue[nextIndex], queue, nextIndex);
    } else if (repeat === 'all') {
      this.play(queue[0], queue, 0);
    } else {
      this.stop();
    }
  }

  previous() {
    const state = this.stateSubject.value;
    let { queue, queueIndex } = state;
    if (queueIndex > 0) {
      this.play(queue[queueIndex - 1], queue, queueIndex - 1);
    } else {
      this.seek(0);
    }
  }

  toggleShuffle() {
    this.updateState({ shuffle: !this.stateSubject.value.shuffle });
  }

  toggleRepeat() {
    const repeatOrder: RepeatMode[] = ['off', 'all', 'one'];
    const currentIdx = repeatOrder.indexOf(this.stateSubject.value.repeat);
    this.updateState({ repeat: repeatOrder[(currentIdx + 1) % repeatOrder.length] });
  }

  /** Handles what happens when a track ends based on repeat mode */
  private handleTrackEnd() {
    const { repeat } = this.stateSubject.value;
    if (repeat === 'one') {
      // Replay current track
      this.seek(0);
      this.audio.play();
    } else {
      this.next();
    }
  }

  private updateState(partial: Partial<PlayerState>) {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...partial,
    });
  }

  async getLocalAudioFiles(): Promise<Track[]> {
  // Dummy data, replace with real logic to read files from device/storage
  return [
    {
      id: 'local_1',
      title: 'Sample Local Song',
      artist: 'Unknown Artist',
      album: 'Local Album',
      duration: 180,
      url: 'assets/audio/sample.mp3', // Point to a real audio file in assets or local FS
      artwork: 'assets/placeholder-album.png',
      isLocal: true
    }
    // Add more mock tracks if you want
  ];
}
}
