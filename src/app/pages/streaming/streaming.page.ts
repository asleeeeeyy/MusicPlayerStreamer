// pages/streaming/streaming.page.ts
import { Component, OnInit } from '@angular/core';
import { JamendoService } from '../../services/jamendo.service';
import { AudioService } from '../../services/audio.service';
import { StorageService } from '../../services/storage.service';
import { Track, Playlist } from '../../models/track.model';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-streaming',
  templateUrl: './streaming.page.html',
  styleUrls: ['./streaming.page.scss'],
})
export class StreamingPage implements OnInit {
  popularTracks: Track[] = [];
  searchResults: Track[] = [];
  playlists: Playlist[] = [];
  searchQuery = '';
  isLoading = false;
  selectedGenre = 'all';
  genres = [
    { id: 'all', name: 'All Genres' },
    { id: 'rock', name: 'Rock' },
    { id: 'pop', name: 'Pop' },
    { id: 'jazz', name: 'Jazz' },
    { id: 'classical', name: 'Classical' },
    { id: 'electronic', name: 'Electronic' },
    { id: 'hiphop', name: 'Hip Hop' }
  ];

  constructor(
    private jamendoService: JamendoService,
    private audioService: AudioService,
    private storageService: StorageService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.storageService.playlists.subscribe(playlists => {
      this.playlists = playlists;
    });
    
    this.loadPopularTracks();
  }

  async loadPopularTracks() {
    this.isLoading = true;
    
    const loading = await this.loadingController.create({
      message: 'Loading popular tracks...',
      spinner: 'circles'
    });
    await loading.present();
    
    try {
      this.jamendoService.getPopularTracks().subscribe(
        tracks => {
          this.popularTracks = tracks;
          this.isLoading = false;
          loading.dismiss();
        },
        error => {
          console.error('Error loading popular tracks:', error);
          this.isLoading = false;
          loading.dismiss();
          this.showErrorToast('Error loading tracks. Please try again.');
        }
      );
    } catch (error) {
      this.isLoading = false;
      loading.dismiss();
      this.showErrorToast('Error loading tracks. Please try again.');
    }
  }

  async searchTracks() {
    if (!this.searchQuery.trim()) {
      return;
    }
    
    this.isLoading = true;
    
    const loading = await this.loadingController.create({
      message: 'Searching...',
      spinner: 'circles'
    });
    await loading.present();
    
    try {
      this.jamendoService.searchTracks(this.searchQuery).subscribe(
        tracks => {
          this.searchResults = tracks;
          this.isLoading = false;
          loading.dismiss();
        },
        error => {
          console.error('Error searching tracks:', error);
          this.isLoading = false;
          loading.dismiss();
          this.showErrorToast('Error searching tracks. Please try again.');
        }
      );
    } catch (error) {
      this.isLoading = false;
      loading.dismiss();
      this.showErrorToast('Error searching tracks. Please try again.');
    }
  }

  async loadTracksByGenre() {
    if (this.selectedGenre === 'all') {
      this.loadPopularTracks();
      return;
    }
    
    this.isLoading = true;
    
    const loading = await this.loadingController.create({
      message: `Loading ${this.selectedGenre} tracks...`,
      spinner: 'circles'
    });
    await loading.present();
    
    try {
      this.jamendoService.getTracksByGenre(this.selectedGenre).subscribe(
        tracks => {
          this.popularTracks = tracks;
          this.isLoading = false;
          loading.dismiss();
        },
        error => {
          console.error('Error loading tracks by genre:', error);
          this.isLoading = false;
          loading.dismiss();
          this.showErrorToast('Error loading tracks. Please try again.');
        }
      );
    } catch (error) {
      this.isLoading = false;
      loading.dismiss();
      this.showErrorToast('Error loading tracks. Please try again.');
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

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });
    toast.present();
  }
}