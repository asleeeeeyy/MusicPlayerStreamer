import { Component, OnInit, OnDestroy } from '@angular/core';
import { AudioService } from '../../services/audio.service';
import { PlayerState } from '../../models/track.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnInit, OnDestroy {
  playerState: PlayerState | null = null;
  private subscription: Subscription | null = null;

  constructor(
    public audioService: AudioService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscription = this.audioService.state.subscribe(state => {
      this.playerState = state;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  goToNowPlaying() {
    this.router.navigate(['/now-playing']);
  }

  togglePlayPause() {
    this.audioService.togglePlayPause();
  }

  nextTrack() {
    this.audioService.next();
  }

  previousTrack() {
    this.audioService.previous();
  }

  seek(event: any) {
    this.audioService.seek(event.detail.value);
  }

  setVolume(event: any) {
    this.audioService.setVolume(event.detail.value);
  }

  stop() {
    this.audioService.stop();
  }

  toggleShuffle() {
    this.audioService.toggleShuffle();
  }

  toggleRepeat() {
    this.audioService.toggleRepeat();
  }

  formatTime(time: number): string {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}
