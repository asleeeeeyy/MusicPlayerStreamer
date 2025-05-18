// src/app/pages/playlists/playlists.page.ts

import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { AudioService } from '../../services/audio.service';
import { Playlist, Track } from '../../models/track.model';
import { AlertController, ToastController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.page.html',
  styleUrls: ['./playlists.page.scss'],
})
export class PlaylistsPage implements OnInit {
  playlists: Playlist[] = [];
  selectedPlaylist: Playlist | null = null;

  constructor(
    private storageService: StorageService,
    private audioService: AudioService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.storageService.playlists.subscribe(playlists => {
      this.playlists = playlists;
      // Update selected playlist if it exists
      if (this.selectedPlaylist) {
        const updated = playlists.find(p => p.id === this.selectedPlaylist?.id);
        if (updated) {
          this.selectedPlaylist = updated;
        }
      }
    });
  }

  selectPlaylist(playlist: Playlist) {
    this.selectedPlaylist = playlist;
  }

  backToPlaylists() {
    this.selectedPlaylist = null;
  }

  async createPlaylist() {
    const alert = await this.alertController.create({
      header: 'New Playlist',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Playlist Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Create',
          handler: (data) => {
            if (!data.name || !data.name.trim()) {
              this.showToast('Please enter a playlist name', 'warning');
              return false; // Keeps the alert open
            }
            const newPlaylist: Playlist = {
              id: uuidv4(),
              name: data.name.trim(),
              tracks: [],
              createdAt: Date.now(),
              updatedAt: Date.now()
            };
            this.storageService.savePlaylist(newPlaylist);
            this.showToast('Playlist created successfully', 'success');
            return true; // Closes the alert
          }
        }
      ]
    });
    await alert.present();
  }

  async renamePlaylist(playlist: Playlist, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const alert = await this.alertController.create({
      header: 'Rename Playlist',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: playlist.name,
          placeholder: 'Playlist Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            if (!data.name || !data.name.trim()) {
              this.showToast('Please enter a playlist name', 'warning');
              return false; // Keeps the alert open
            }
            const updatedPlaylist: Playlist = {
              ...playlist,
              name: data.name.trim(),
              updatedAt: Date.now()
            };
            this.storageService.savePlaylist(updatedPlaylist);
            this.showToast('Playlist renamed successfully', 'success');
            return true; // Closes the alert
          }
        }
      ]
    });
    await alert.present();
  }

  async deletePlaylist(playlist: Playlist, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const alert = await this.alertController.create({
      header: 'Delete Playlist',
      message: `Are you sure you want to delete "${playlist.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.storageService.deletePlaylist(playlist.id);
            if (this.selectedPlaylist && this.selectedPlaylist.id === playlist.id) {
              this.selectedPlaylist = null;
            }
            this.showToast('Playlist deleted successfully', 'success');
            return true; // Not required here but harmless
          }
        }
      ]
    });
    await alert.present();
  }

  playTrack(track: Track) {
    this.audioService.play(track);
  }

  async removeTrackFromPlaylist(track: Track, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (!this.selectedPlaylist) return;
    const alert = await this.alertController.create({
      header: 'Remove Track',
      message: `Remove "${track.title}" from "${this.selectedPlaylist.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          handler: () => {
            if (this.selectedPlaylist) {
              this.storageService.removeTrackFromPlaylist(this.selectedPlaylist.id, track.id);
              this.showToast('Track removed from playlist', 'success');
            }
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    toast.present();
  }
}
