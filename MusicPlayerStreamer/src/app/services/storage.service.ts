import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Track } from '../models/track.model';

export interface Playlist {
  name: string;
  tracks: Track[];
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private _storage: Storage | null = null;
  private initialized = false;

  constructor(private storage: Storage) {
    this.init();
  }

  
  async init() {
    if (!this.initialized) {
      this._storage = await this.storage.create();
      this.initialized = true;
      console.log('Storage initialized');
    }
  }


  async getFavorites(): Promise<any[]> {
    await this.init();
    return (await this._storage?.get('favorites')) || [];
  }

  async setFavorites(data: any[]): Promise<void> {
    await this.init();
    await this._storage?.set('favorites', data);
  }

  
  async getPlaylists(): Promise<Playlist[]> {
    await this.init();
    return (await this._storage?.get('playlists')) || [];
  }

  async setPlaylists(data: Playlist[]): Promise<void> {
    await this.init();
    try {
      await this._storage?.set('playlists', data);
      console.log('Playlists saved:', data);
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  }

  async addPlaylist(name: string): Promise<void> {
    const playlists = await this.getPlaylists();
    if (playlists.some(p => p.name === name)) return; 
    playlists.push({ name, tracks: [] });
    await this.setPlaylists(playlists);
  }

  async removePlaylist(name: string): Promise<void> {
  const playlists = await this.getPlaylists();
  const updated = playlists.filter(pl => pl.name !== name);
  await this.setPlaylists(updated);
}

  async addTrackToPlaylist(playlistName: string, track: Track): Promise<void> {
    const playlists = await this.getPlaylists();
    const playlist = playlists.find(pl => pl.name === playlistName);
    if (playlist) {
      // Prevent duplicate tracks by id
      if (!playlist.tracks.some(t => t.id === track.id)) {
        playlist.tracks.push(track);
        await this.setPlaylists(playlists);
      }
    }
  }

  
  async getUploadedTracks(): Promise<Track[]> {
    await this.init();
    return (await this._storage?.get('uploadedTracks')) || [];
  }

  async setUploadedTracks(data: Track[]): Promise<void> {
    await this.init();
    await this._storage?.set('uploadedTracks', data);
  }

  
  async getAlbums(): Promise<{ [album: string]: Track[] }> {
    await this.init();
    return (await this._storage?.get('albums')) || {};
  }

  async setAlbums(albums: { [album: string]: Track[] }): Promise<void> {
    await this.init();
    await this._storage?.set('albums', albums);
  }

  
  async getLocalFiles(): Promise<Track[]> {
    await this.init();
    return (await this._storage?.get('localFiles')) || [];
  }

  async setLocalFiles(data: Track[]): Promise<void> {
    await this.init();
    await this._storage?.set('localFiles', data);
  }

  async addLocalFile(track: Track): Promise<Track[]> {
    const files = await this.getLocalFiles();
    const exists = files.some(t => t.fileUrl === track.fileUrl);
    if (!exists) {
      files.push(track);
      await this.setLocalFiles(files);
    }
    return files;
  }

  async removeLocalFile(fileUrl: string): Promise<Track[]> {
    const files = await this.getLocalFiles();
    const updatedFiles = files.filter(t => t.fileUrl !== fileUrl);
    await this.setLocalFiles(updatedFiles);
    return updatedFiles;
  }
}
