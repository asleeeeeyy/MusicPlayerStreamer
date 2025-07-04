import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeezerService {
  private apiUrl = 'https://deezerdevs-deezer.p.rapidapi.com';

  private headers = new HttpHeaders({
    'X-RapidAPI-Key': 'cb31790554mshb9aab30cca7eb0bp118b4cjsnacb72c950330',
    'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com',
  });

  constructor(private http: HttpClient) {}

  async searchTracks(query: string): Promise<any[]> {
    try {
      const response: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`, {
          headers: this.headers,
        })
      );
      return response?.data ?? [];
    } catch (error) {
      console.error('Error searching tracks via RapidAPI:', error);
      return [];
    }
  }

  async getTracksByArtist(artistKey: string): Promise<any[]> {
    
    let artistQuery = '';
    switch (artistKey.toLowerCase()) {
      case 'taylorswift':
        artistQuery = 'Taylor Swift';
        break;
      case 'edsheeran':
        artistQuery = 'Ed Sheeran';
        break;
      case 'arianagrande':
        artistQuery = 'Ariana Grande';
        break;
      default:
        artistQuery = 'Taylor Swift';
    }

    try {
      const response: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/search?q=${encodeURIComponent(artistQuery)}`, {
          headers: this.headers,
        })
      );
      return response?.data ?? [];
    } catch (error) {
      console.error('Error fetching tracks by artist via RapidAPI:', error);
      return [];
    }
  }

  async getPopularTracks(): Promise<any[]> {
    try {

      const response: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/search?q=top`, { headers: this.headers })
      );
      return response?.data ?? [];
  
    } catch (error) {
      console.error('Error fetching popular tracks:', error);
      return [];
    }
  }
}
