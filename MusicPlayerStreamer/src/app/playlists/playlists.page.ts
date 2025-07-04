import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { StorageService, Playlist } from '../services/storage.service';
import { PlayerService } from '../services/player.service';
import { Track } from '../models/track.model';
import { Router } from '@angular/router';
import { MiniPlayerComponent } from '../mini-player/mini-player.page';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.page.html',
  styleUrls: ['./playlists.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, MiniPlayerComponent]
})
export class PlaylistsPage implements OnInit {
  playlists: Playlist[] = [];
  selectedPlaylist: Playlist | null = null;

  constructor(
    private storageService: StorageService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public playerService: PlayerService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.refreshPlaylists();
  }

  async ionViewWillEnter() {
    await this.refreshPlaylists();
  }

  async refreshPlaylists() {
    this.playlists = await this.storageService.getPlaylists();
    if (this.selectedPlaylist) {
      const updated = this.playlists.find(pl => pl.name === this.selectedPlaylist?.name);
      if (updated) this.selectedPlaylist = updated;
    }
  }

  async addPlaylist() {
    const alert = await this.alertCtrl.create({
      header: 'New Playlist',
      inputs: [{ name: 'name', type: 'text', placeholder: 'Playlist Name' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: async (data) => {
            const name = (data.name || '').trim();
            if (name) {
              await this.storageService.addPlaylist(name);
              await this.refreshPlaylists();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async removePlaylist(name: string) {
    await this.storageService.removePlaylist(name);
    await this.refreshPlaylists();
    const toast = await this.toastCtrl.create({
      message: `Playlist "${name}" removed.`,
      duration: 1000,
      color: 'danger'
    });
    toast.present();
    this.selectedPlaylist = null;
  }

  selectPlaylist(playlist: Playlist) {
    this.selectedPlaylist = playlist;
  }

  backToList() {
    this.selectedPlaylist = null;
  }

  playTrack(track: Track) {
    if (!track.fileUrl) {
      this.toastCtrl.create({
        message: 'Track not playable.',
        duration: 1200,
        color: 'warning'
      }).then(toast => toast.present());
      return;
    }
    if (this.selectedPlaylist) {
      this.playerService.setPlaylist(this.selectedPlaylist.tracks);
      const idx = this.selectedPlaylist.tracks.findIndex(t => t.id === track.id);
      if (idx !== -1) this.playerService.playAtIndex(idx);
    }
  }

  gotoTab(tab: string) {
    this.router.navigate(['/' + tab]);
  }
}
