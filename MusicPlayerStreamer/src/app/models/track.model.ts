export interface Track {
  id: string;                
  title: string;
  artist: string;
  image: string;
  fileUrl: string;
  isLocal?: boolean;
  album?: string;
  albumId?: number;
  artistId?: number;
  duration?: number;
  previewUrl?: string;
}
