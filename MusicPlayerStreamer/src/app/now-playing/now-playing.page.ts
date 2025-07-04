import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { PlayerService } from '../services/player.service';
import { StorageService } from '../services/storage.service';  // ADD THIS
import { Track } from '../models/track.model';

@Component({
  selector: 'app-now-playing',
  templateUrl: './now-playing.page.html',
  styleUrls: ['./now-playing.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class NowPlayingPage implements OnInit, OnDestroy {
  currentTrack: Track | null = null;
  isPlaying = false;
  currentTime = 0;
  duration = 0;

  private subscriptions = new Subscription();

  constructor(
    private playerService: PlayerService,
    private alertCtrl: AlertController,           // ADD THIS
    private storageService: StorageService        // ADD THIS
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.playerService.currentTrack$.subscribe(track => {
        this.currentTrack = track;
      })
    );
    this.subscriptions.add(
      this.playerService.isPlaying$.subscribe(isPlaying => {
        this.isPlaying = isPlaying;
      })
    );
    this.subscriptions.add(
      this.playerService.currentTime$.subscribe(time => {
        this.currentTime = time;
      })
    );
    this.subscriptions.add(
      this.playerService.trackDuration$.subscribe(duration => {
        this.duration = duration;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onSeek(event: CustomEvent) {
    const newTime = event.detail.value;
    this.playerService.seekTo(newTime);
  }

  onPlayPrevious(event: Event) {
    event.stopPropagation();
    this.playerService.playPrevious();
  }

  onPlayNext(event: Event) {
    event.stopPropagation();
    this.playerService.playNext();
  }

  onTogglePlayPause(event: Event) {
    event.stopPropagation();
    if (this.isPlaying) {
      this.playerService.pause();
    } else {
      this.playerService.resume();
    }
  }

  formatTime(seconds: number): string {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  
  async onAddToPlaylist() {
    if (!this.currentTrack) return;
    const playlists = await this.storageService.getPlaylists();
    if (!playlists.length) {
      const alert = await this.alertCtrl.create({
        header: 'No Playlists',
        message: 'Please create a playlist first in the Playlists tab.',
        buttons: ['OK'],
      });
      return alert.present();
    }

    const alert = await this.alertCtrl.create({
      header: 'Add to Playlist',
      inputs: playlists.map(pl => ({
        name: 'playlist',
        type: 'radio',
        label: pl.name,
        value: pl.name,
      })),
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: async (playlistName) => {
            await this.storageService.addTrackToPlaylist(playlistName, this.currentTrack!);
          },
        },
      ],
    });
    await alert.present();
  }
}
