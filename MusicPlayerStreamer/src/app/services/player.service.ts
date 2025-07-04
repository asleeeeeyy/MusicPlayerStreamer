import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { Media, MediaObject } from '@awesome-cordova-plugins/media/ngx';
import { Platform } from '@ionic/angular';
import { Howl } from 'howler';
import { Track } from '../models/track.model';
import { Capacitor } from '@capacitor/core';
import { File } from '@awesome-cordova-plugins/file/ngx';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private mediaObject: MediaObject | null = null;
  private howlerInstance: Howl | null = null;
  private androidProgressInterval: number | null = null;
  private playlist: Track[] = [];
  private currentIndex = -1;

  currentTrack$ = new BehaviorSubject<Track | null>(null);
  isPlaying$ = new BehaviorSubject<boolean>(false);
  trackDuration$ = new BehaviorSubject<number>(0);
  currentTime$ = new BehaviorSubject<number>(0);
  playbackError$ = new BehaviorSubject<string | null>(null);

  private howlerProgressSubscription: Subscription | null = null;
  private mediaStatusSubscription: any = null;

  constructor(
    private media: Media,
    private platform: Platform,
    private zone: NgZone,
    private file: File
  ) {}

  setPlaylist(playlist: Track[]) {
    this.playlist = playlist || [];
    this.currentIndex = -1;
  }

  playAtIndex(index: number) {
    if (index < 0 || index >= this.playlist.length) return;
    this.currentIndex = index;
    this.play(this.playlist[index]);
  }

  async play(track: Track): Promise<void> {
    this.stop();
    this.playbackError$.next(null);

    if (!track.fileUrl) {
      this.playbackError$.next('No playable source for this track');
      return;
    }

    if (!Capacitor.isNativePlatform() && track.fileUrl.startsWith('blob:')) {
      this.howlerInstance = new Howl({
        src: [track.fileUrl],
        html5: true,
        onload: () => this.trackDuration$.next(this.howlerInstance?.duration() || 0),
        onplay: () => this.zone.run(() => this.isPlaying$.next(true)),
        onend: () => {
          this.zone.run(() => {
            this.isPlaying$.next(false);
            this.currentTime$.next(0);
            this.trackDuration$.next(0);
            this.playNext();
          });
        },
        onpause: () => this.zone.run(() => this.isPlaying$.next(false)),
        onstop: () => this.zone.run(() => this.isPlaying$.next(false)),
        onloaderror: (id, error) => this.zone.run(() => this.playbackError$.next(`Cannot load audio: ${track.title}`)),
        onplayerror: (id, error) => this.zone.run(() => this.playbackError$.next(`Cannot play audio: ${track.title}`)),
      });
      this.howlerInstance.play();
      this.startHowlerProgressTracking();
      this.currentTrack$.next(track);
      return;
    }

   
    if ((this.platform.is('cordova') || (this.platform.is('android') && Capacitor.isNativePlatform()))
      && track.fileUrl.startsWith('file://')) {

      this.mediaObject = this.media.create(track.fileUrl);

      this.mediaObject.onError.subscribe(error => {
        this.zone.run(() => {
          this.playbackError$.next(`Playback error: ${error}`);
          this.isPlaying$.next(false);
        });
      });

      this.mediaStatusSubscription = this.mediaObject.onStatusUpdate.subscribe(status => {
        if (status === 4) {
          this.zone.run(() => {
            this.isPlaying$.next(false);
            this.currentTime$.next(0);
            this.trackDuration$.next(0);
            this.playNext();
          });
        }
      });

      this.mediaObject.play();

      const durationPoll = setInterval(() => {
        if (!this.mediaObject) {
          clearInterval(durationPoll);
          return;
        }
        const dur = this.mediaObject.getDuration() || -1;
        if (dur > 0) {
          this.zone.run(() => {
            this.trackDuration$.next(dur);
          });
          clearInterval(durationPoll);
        }
      }, 500);

      this.startAndroidProgressTracking();
      this.zone.run(() => {
        this.isPlaying$.next(true);
      });
      this.currentTrack$.next(track);
      return;
    }

    this.howlerInstance = new Howl({
      src: [track.fileUrl],
      html5: true,
      onload: () => this.trackDuration$.next(this.howlerInstance?.duration() || 0),
      onplay: () => this.zone.run(() => this.isPlaying$.next(true)),
      onend: () => {
        this.zone.run(() => {
          this.isPlaying$.next(false);
          this.currentTime$.next(0);
          this.trackDuration$.next(0);
          this.playNext();
        });
      },
      onpause: () => this.zone.run(() => this.isPlaying$.next(false)),
      onstop: () => this.zone.run(() => this.isPlaying$.next(false)),
      onloaderror: (id, error) => this.zone.run(() => this.playbackError$.next(`Cannot load audio: ${track.title}`)),
      onplayerror: (id, error) => this.zone.run(() => this.playbackError$.next(`Cannot play audio: ${track.title}`)),
    });
    this.howlerInstance.play();
    this.startHowlerProgressTracking();
    this.currentTrack$.next(track);
  }

  private startHowlerProgressTracking(): void {
    this.stopHowlerProgressTracking();
    this.howlerProgressSubscription = interval(500).subscribe(() => {
      if (this.howlerInstance && this.isPlaying$.value) {
        const time = this.howlerInstance.seek() as number;
        this.currentTime$.next(time);
      }
    });
  }

  private stopHowlerProgressTracking(): void {
    if (this.howlerProgressSubscription) {
      this.howlerProgressSubscription.unsubscribe();
      this.howlerProgressSubscription = null;
    }
  }

  private startAndroidProgressTracking(): void {
    this.stopAndroidProgressTracking();
    if (!this.mediaObject) return;
    this.androidProgressInterval = window.setInterval(() => {
      if (!this.mediaObject) {
        this.stopAndroidProgressTracking();
        return;
      }
      this.mediaObject.getCurrentPosition().then(position => {
        if (position >= 0) {
          this.zone.run(() => {
            this.currentTime$.next(position);
          });
        }
      }).catch(() => {});
    }, 500);
  }

  private stopAndroidProgressTracking(): void {
    if (this.androidProgressInterval !== null) {
      clearInterval(this.androidProgressInterval);
      this.androidProgressInterval = null;
    }
  }

  pause(): void {
    if (this.howlerInstance) {
      this.howlerInstance.pause();
    } else if (this.mediaObject) {
      this.mediaObject.pause();
    }
    this.zone.run(() => {
      this.isPlaying$.next(false);
    });
  }

  resume(): void {
    if (!this.currentTrack$.value) return;
    if (this.howlerInstance) {
      this.howlerInstance.play();
    } else if (this.mediaObject) {
      this.mediaObject.play();
    } else if (this.currentTrack$.value) {
      this.play(this.currentTrack$.value);
      return;
    }
    this.zone.run(() => {
      this.isPlaying$.next(true);
    });
  }

  togglePlayPause(): void {
    const currentlyPlaying = this.isPlaying$.value;
    if (currentlyPlaying) {
      this.pause();
    } else {
      if (!this.currentTrack$.value && this.playlist.length > 0) {
        this.playAtIndex(0);
      } else {
        this.resume();
      }
    }
  }

  stop(): void {
    if (this.mediaObject) {
      this.mediaObject.stop();
      this.mediaObject.release();
      this.mediaObject = null;
      if (this.mediaStatusSubscription) {
        this.mediaStatusSubscription.unsubscribe();
        this.mediaStatusSubscription = null;
      }
      this.stopAndroidProgressTracking();
    }
    if (this.howlerInstance) {
      this.howlerInstance.stop();
      this.howlerInstance = null;
      this.stopHowlerProgressTracking();
    }
    this.zone.run(() => {
      this.isPlaying$.next(false);
      this.currentTime$.next(0);
      this.trackDuration$.next(0);
    });
  }

  seekTo(time: number): void {
    if (this.howlerInstance) {
      this.howlerInstance.seek(time);
      this.currentTime$.next(time);
    } else if (this.mediaObject) {
      this.mediaObject.seekTo(time * 1000);
      this.currentTime$.next(time);
    }
  }

  playPrevious(): void {
    if (!this.playlist.length) return;
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.play(this.playlist[this.currentIndex]);
  }

  playNext(): void {
    if (!this.playlist.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.play(this.playlist[this.currentIndex]);
  }

  getPlaylist(): Track[] {
    return [...this.playlist];
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }
}
