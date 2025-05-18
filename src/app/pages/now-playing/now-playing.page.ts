import { Component, OnInit, OnDestroy } from '@angular/core';
import { AudioService, PlayerState } from '../../services/audio.service';
import { StorageService } from '../../services/storage.service';
import { AlertController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Track, Playlist } from '../../models/track.model';

@Component({
  selector: 'app-now-playing',
  templateUrl: './now-playing.page.html',
  styleUrls: ['./now-playing.page.scss'],
})
export class NowPlayingPage implements OnInit, OnDestroy {
  playerState: PlayerState | null = null;
  subscription: Subscription | null = null;
  playlists: Playlist[] = [];

  constructor(
    public audioService: AudioService,
    private storageService: StorageService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.subscription = this.audioService.state.subscribe((state: PlayerState) => {
      this.playerState = state;
    });

    // Subscribe or load playlists
    this.storageService.playlists.subscribe((pls) => {
      this.playlists = pls;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
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

  toggleShuffle() {
    this.audioService.toggleShuffle();
  }

  toggleRepeat() {
    this.audioService.toggleRepeat();
  }

  seek(event: any) {
    this.audioService.seek(event.detail.value);
  }

  setVolume(event: any) {
    this.audioService.setVolume(event.detail.value);
  }

  formatTime(time: number): string {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  async addToPlaylist() {
    if (!this.playlists || this.playlists.length === 0) {
      const toast = await this.toastController.create({
        message: 'No playlists found. Please create a playlist first.',
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      toast.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Add to Playlist',
      inputs: this.playlists.map((playlist, i) => ({
        name: `playlist_${i}`,
        type: 'radio',
        label: playlist.name,
        value: playlist.id,
        checked: i === 0
      })),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: (playlistId: string) => {
            const track = this.playerState?.currentTrack;
            if (track) {
              this.storageService.addTrackToPlaylist(playlistId, track);
              this.toastController.create({
                message: 'Track added to playlist',
                duration: 1500,
                position: 'bottom'
              }).then(toast => toast.present());
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
