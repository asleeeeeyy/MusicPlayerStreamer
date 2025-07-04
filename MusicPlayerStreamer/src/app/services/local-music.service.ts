import { Injectable } from '@angular/core';
import { parseBlob } from 'music-metadata-browser';

@Injectable({ providedIn: 'root' })
export class LocalMusicService {
  async readAudioMetadata(blobOrFile: Blob | File): Promise<{ title?: string; artist?: string; image?: string }> {
    try {
      const metadata = await parseBlob(blobOrFile);
      const title = metadata.common.title || undefined;
      const artist = metadata.common.artist || undefined;
      let image: string | undefined;

      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const pic = metadata.common.picture[0];
        const base64String = btoa(
          new Uint8Array(pic.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        image = `data:${pic.format};base64,${base64String}`;
      }

      return { title, artist, image };
    } catch (error) {
      return {};
    }
  }
}