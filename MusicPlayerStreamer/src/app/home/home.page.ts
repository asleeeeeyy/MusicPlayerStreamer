import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { DeezerService } from '../services/deezer.service';
import { PlayerService } from '../services/player.service';
import { Track } from '../models/track.model';
import { MiniPlayerComponent } from '../mini-player/mini-player.page'; // Adjust path if needed

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, MiniPlayerComponent],
})
export class HomePage implements OnInit, OnDestroy {
  searchQuery = '';
  searchResults: Track[] = [];
  isSearching = false;
  selectedGenre: string = 'taylorswift';
  genreTracks: Track[] = [];
  currentTrack: Track | null = null;
  isPlaying = false;
  playlist: Track[] = [];
  currentTrackIndex: number = -1;

  private subscriptions = new Subscription();

  constructor(
    private deezerService: DeezerService,
    private playerService: PlayerService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.loadTracksByGenre(this.selectedGenre);

    this.playlist = [...this.genreTracks];
    this.currentTrackIndex = -1;

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

  async loadTracksByGenre(artistKey: string) {
    this.isSearching = true;
    try {
      const response = await this.deezerService.getTracksByArtist(artistKey);
      this.genreTracks = response.map((item: any) => ({
        id: uuidv4(),
        title: item.title,
        artist: item.artist?.name ?? 'Unknown Artist',
        image: item.album?.cover_medium ?? 'assets/placeholder.png',
        fileUrl: item.preview,
        isLocal: false,
      }));

      this.playlist = [...this.genreTracks];
      this.currentTrackIndex = -1;
      this.playerService.setPlaylist(this.playlist);
    } catch (error) {
      console.error('Error loading artist tracks:', error);
      this.genreTracks = [];
      this.playlist = [];
      this.currentTrackIndex = -1;
      this.playerService.setPlaylist([]);
    } finally {
      this.isSearching = false;
    }
  }

  async searchMusic() {
    const query = this.searchQuery.trim();
    if (!query) {
      this.searchResults = [];
      this.playlist = [];
      this.currentTrackIndex = -1;
      this.playerService.setPlaylist([]);
      return;
    }

    this.isSearching = true;
    try {
      const response = await this.deezerService.searchTracks(query);
      this.searchResults = response.map((item: any) => ({
        id: uuidv4(),
        title: item.title,
        artist: item.artist?.name ?? 'Unknown Artist',
        image: item.album?.cover_medium ?? 'assets/placeholder.png',
        fileUrl: item.preview,
        isLocal: false,
      }));

      this.playlist = [...this.searchResults];
      this.currentTrackIndex = -1;
      this.playerService.setPlaylist(this.playlist);
    } catch (error) {
      console.error('Error searching tracks:', error);
      this.searchResults = [];
      this.playlist = [];
      this.currentTrackIndex = -1;
      this.playerService.setPlaylist([]);
    } finally {
      this.isSearching = false;
    }
  }

  playStream(track: Track) {
    if (!track.fileUrl) {
      this.showToast('Preview not available');
      return;
    }
    this.playlist = this.searchResults.length > 0 ? [...this.searchResults] : [...this.genreTracks];
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

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      position: 'bottom',
    });
    toast.present();
  }
}
