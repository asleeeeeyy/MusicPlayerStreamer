// services/storage.service.ts
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Playlist, Track, AppSettings } from '../models/track.model';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private _playlists = new BehaviorSubject<Playlist[]>([]);

  constructor(private storage: Storage) {}

  async init() {
    // Initialize storage
    await this.storage.defineDriver(CordovaSQLiteDriver);
    const storage = await this.storage.create();
    this._storage = storage;
    
    // Load playlists
    await this.loadPlaylists();
    
    // Initialize settings if not exist
    const settings = await this.getSettings();
    if (!settings) {
      await this.saveSettings(this.getDefaultSettings());
    }
  }

  // Generic get/set methods
  async get(key: string): Promise<any> {
    return this._storage?.get(key);
  }

  async set(key: string, value: any): Promise<any> {
    return this._storage?.set(key, value);
  }

  async remove(key: string): Promise<any> {
    return this._storage?.remove(key);
  }

  // Playlist specific methods
  get playlists(): Observable<Playlist[]> {
    return this._playlists.asObservable();
  }

  private async loadPlaylists() {
    const playlists = await this._storage?.get('playlists') || [];
    this._playlists.next(playlists);
  }

  async savePlaylist(playlist: Playlist): Promise<void> {
    const playlists = this._playlists.value;
    const index = playlists.findIndex(p => p.id === playlist.id);
    
    if (index !== -1) {
      // Update existing playlist
      playlists[index] = {
        ...playlist,
        updatedAt: Date.now()
      };
    } else {
      // Add new playlist
      playlists.push({
        ...playlist,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
    
    await this._storage?.set('playlists', playlists);
    this._playlists.next([...playlists]);
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    const playlists = this._playlists.value.filter(p => p.id !== playlistId);
    await this._storage?.set('playlists', playlists);
    this._playlists.next([...playlists]);
  }

  async addTrackToPlaylist(playlistId: string, track: Track): Promise<void> {
    const playlists = this._playlists.value;
    const index = playlists.findIndex(p => p.id === playlistId);
    
    if (index !== -1) {
      // Check if track already exists in playlist
      const trackExists = playlists[index].tracks.some(t => t.id === track.id);
      
      if (!trackExists) {
        playlists[index].tracks.push(track);
        playlists[index].updatedAt = Date.now();
        
        await this._storage?.set('playlists', playlists);
        this._playlists.next([...playlists]);
      }
    }
  }

  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
    const playlists = this._playlists.value;
    const index = playlists.findIndex(p => p.id === playlistId);
    
    if (index !== -1) {
      playlists[index].tracks = playlists[index].tracks.filter(t => t.id !== trackId);
      playlists[index].updatedAt = Date.now();
      
      await this._storage?.set('playlists', playlists);
      this._playlists.next([...playlists]);
    }
  }

  // Settings methods
  async getSettings(): Promise<AppSettings | null> {
    return this._storage?.get('settings');
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await this._storage?.set('settings', settings);
  }

  private getDefaultSettings(): AppSettings {
    return {
      theme: 'light',
      equalizer: {
        enabled: false,
        presets: {
          flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          rock: [4, 3, 2, 0, -1, -1, 0, 2, 3, 4],
          pop: [-1, 0, 2, 3, 4, 3, 1, 0, -1, -2],
          jazz: [3, 2, 1, 2, -1, -2, 0, 1, 2, 3],
          classical: [4, 3, 2, 1, 0, -1, -2, -2, -1, 0]
        },
        currentPreset: 'flat'
      },
      audioQuality: 'high'
    };
  }
}