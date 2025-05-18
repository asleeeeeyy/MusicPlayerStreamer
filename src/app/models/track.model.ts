// models/track.model.ts
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  url: string;
  artwork?: string;
  isLocal: boolean;
  format?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: number;
  updatedAt: number;
}

export interface JamendoTrack {
  id: string;
  name: string;
  duration: number;
  artist_name: string;
  album_name: string;
  album_image: string;
  audio: string;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  equalizer: {
    enabled: boolean;
    presets: { [key: string]: number[] };
    currentPreset: string;
  };
  audioQuality: 'low' | 'medium' | 'high';
}