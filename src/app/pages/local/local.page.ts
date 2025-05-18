// pages/local/local.page.ts
import { Component, OnInit } from '@angular/core';
import { AudioService } from '../../services/audio.service';
import { StorageService } from '../../services/storage.service';
import { Track, Playlist } from '../../models/track.model';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-local',
  templateUrl: './local.page.html',
  styleUrls: ['./local.page.scss'],
})
export class LocalPage implements OnInit {
  localTracks: Track[] = [];
  playlists: Playlist[] = [];
  isLoading = false;

  constructor(
    private audioService: AudioService,
    private storageService: StorageService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.storageService.playlists.subscribe(playlists => {
      this.playlists = playlists;
    });
    
    await this.loadLocalTracks();
  }

  async loadLocalTracks() {
    this.isLoading = true;
    
    const loading = await this.loadingController.create({
      message: 'Loading local tracks...',
      spinner: 'circles'
    });
    await loading.present();
    
    try {
      this.localTracks = await this.audioService.getLocalAudioFiles();
      
      // Extract metadata for each track (in a real app)
      // for (let track of this.localTracks) {
      //   track = await this.audioService.extractMetadata(track);
      // }
    } catch (error) {
      console.error('Error loading local tracks:', error);
      const toast = await this.toastController.create({
        message: 'Error loading local tracks. Please try again.',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      toast.present();
    } finally {
      this.isLoading = false;
      loading.dismiss();
    }
  }

  playTrack(track: Track) {
    this.audioService.play(track);
  }

  async addToPlaylist(track: Track) {
    if (this.playlists.length === 0) {
      const toast = await this.toastController.create({
        message: 'Create a playlist first',
        duration: 2000,
        position: 'bottom'
      });
      toast.present();
      return;
    }
    
    const alert = await this.alertController.create({
      header: 'Add to Playlist',
      // pages/local/local.page.ts (continued)
      inputs: this.playlists.map((playlist, index) => ({
        name: `playlist_${index}`,
        type: 'radio',
        label: playlist.name,
        value: playlist.id,
        checked: index === 0
      })),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: (playlistId) => {
            this.storageService.addTrackToPlaylist(playlistId, track);
            this.toastController.create({
              message: 'Track added to playlist',
              duration: 2000,
              position: 'bottom'
            }).then(toast => toast.present());
          }
        }
      ]
    });
    
    await alert.present();
  }

  async refresh(event: any) {
    await this.loadLocalTracks();
    event.target.complete();
  }
}