import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { PlayerService } from '../services/player.service';
import { Track } from '../models/track.model';
import { FilePickerService } from '../services/file-picker.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-local-music',
  templateUrl: './local-music.page.html',
  styleUrls: ['./local-music.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class LocalMusicPage implements OnInit, OnDestroy {
  localFiles: Track[] = [];
  currentTrack: Track | null = null;
  isPlaying = false;
  playlist: Track[] = [];
  currentTrackIndex: number = -1;
  private subscriptions = new Subscription();
  isNative = Capacitor.isNativePlatform(); 

  constructor(
    private playerService: PlayerService,
    private filePickerService: FilePickerService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.playerService.currentTrack$.subscribe(track => {
        this.currentTrack = track;
        if (track) {
          this.currentTrackIndex = this.playlist.findIndex(t => t.fileUrl === track.fileUrl);
        } else {
          this.currentTrackIndex = -1;
        }
      })
    );

    this.subscriptions.add(
      this.playerService.isPlaying$.subscribe(state => (this.isPlaying = state))
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  playStream(track: Track) {
    this.playlist = [...this.localFiles];
    this.playerService.setPlaylist(this.playlist);
    const index = this.playlist.findIndex(t => t.fileUrl === track.fileUrl);
    if (index !== -1) {
      this.playerService.playAtIndex(index);
    }
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.playerService.pause();
    } else {
      this.playerService.resume();
    }
  }

  playPrevious() {
    this.playerService.playPrevious();
  }

  playNext() {
    this.playerService.playNext();
  }

  goToNowPlaying() {
    this.router.navigate(['/now-playing']);
  }

  gotoTab(tab: string) {
    this.router.navigate(['/' + tab]);
  }

  async addLocalFile() {
    const track = await this.filePickerService.pickAudioFile();
    if (track) {
      this.localFiles.push(track);
      this.showToast('Added local file: ' + track.title);
    }
  }

  async onFileSelected(event: Event) {
    const track = await this.filePickerService.onFileSelected(event);
    if (track) {
      this.localFiles.push(track);
      this.showToast('Added local file: ' + track.title);
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      position: 'bottom',
    });
    toast.present();
  }
}
