// services/jamendo.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JamendoTrack, Track } from '../models/track.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JamendoService {
  private readonly API_URL = environment.jamendoApiUrl;
  private readonly CLIENT_ID = environment.jamendoClientId;

  constructor(private http: HttpClient) {}

  searchTracks(query: string, limit: number = 20): Observable<Track[]> {
    const url = `${this.API_URL}/tracks/?client_id=${this.CLIENT_ID}&format=json&limit=${limit}&search=${query}`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        return response.results.map((track: JamendoTrack) => this.convertToTrack(track));
      })
    );
  }

  getPopularTracks(limit: number = 20): Observable<Track[]> {
  const url = `${this.API_URL}/tracks/?client_id=${this.CLIENT_ID}&format=json&limit=${limit}&order=popularity_total`;
  return this.http.get<any>(url).pipe(
    map(response => {
      if (!response.results) return [];
      return response.results
        .filter((track: JamendoTrack) => !!track.audio)
        .map((track: JamendoTrack) => this.convertToTrack(track));
    })
  );
}


  getTracksByGenre(genre: string, limit: number = 20): Observable<Track[]> {
    const url = `${this.API_URL}/tracks/?client_id=${this.CLIENT_ID}&format=json&limit=${limit}&tags=${genre}`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        return response.results.map((track: JamendoTrack) => this.convertToTrack(track));
      })
    );
  }

  private convertToTrack(jamendoTrack: JamendoTrack): Track {
    return {
      id: `jamendo_${jamendoTrack.id}`,
      title: jamendoTrack.name,
      artist: jamendoTrack.artist_name,
      album: jamendoTrack.album_name,
      duration: jamendoTrack.duration,
      url: jamendoTrack.audio,
      artwork: jamendoTrack.album_image,
      isLocal: false
    };
  }
}