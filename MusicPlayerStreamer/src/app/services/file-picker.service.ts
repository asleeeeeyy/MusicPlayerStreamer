import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { LocalMusicService } from './local-music.service';
import { Track } from '../models/track.model';
import { FilePath } from '@awesome-cordova-plugins/file-path/ngx';
import { File as CordovaFile } from '@awesome-cordova-plugins/file/ngx';
import { Platform } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

declare const fileChooser: any;

@Injectable({ providedIn: 'root' })
export class FilePickerService {
  constructor(
    private localMusicService: LocalMusicService,
    private filePath: FilePath,
    private file: CordovaFile,
    private platform: Platform
  ) {}

  async pickAudioFile(): Promise<Track | null> {
    if (this.platform.is('android') && Capacitor.isNativePlatform()) {
      try {
        const uri: string = await new Promise((resolve, reject) => {
          fileChooser.open(resolve, reject);
        });

        const resolvedPath = await this.filePath.resolveNativePath(uri);
        const blob = await this.readNativeFileAsBlob(resolvedPath);
        const meta = await this.localMusicService.readAudioMetadata(blob);
        const fileName = resolvedPath.split('/').pop() ?? 'Unknown Title';

        return {
          id: uuidv4(),
          title: meta.title || fileName.replace(/\.[^/.]+$/, ''),
          artist: meta.artist || 'Unknown Artist',
          image: meta.image || 'assets/placeholder.png',
          fileUrl: resolvedPath.startsWith('file://') ? resolvedPath : 'file://' + resolvedPath,
          isLocal: true,
        };
      } catch (err) {
        console.error('Cordova file chooser error:', err);
        return null;
      }
    } else {
      try {
        const result = await FilePicker.pickFiles({ types: ['audio/*'] });
        const file = result.files?.[0] as any;
        if (!file) return null;

        const pathOrWebPath = file.webPath ?? file.path ?? '';
        if (!pathOrWebPath) return null;

        const response = await fetch(pathOrWebPath);
        const blob = await response.blob();
        const meta = await this.localMusicService.readAudioMetadata(blob);

        return {
          id: uuidv4(),
          title: meta.title || file.name || 'Unknown Title',
          artist: meta.artist || 'Unknown Artist',
          image: meta.image || 'assets/placeholder.png',
          fileUrl: URL.createObjectURL(blob),
          isLocal: true,
        };
      } catch (err) {
        console.error('File picking failed', err);
        return null;
      }
    }
  }

  async onFileSelected(event: Event): Promise<Track | null> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return null;

    try {
      const meta = await this.localMusicService.readAudioMetadata(file);
      return {
        id: uuidv4(),
        title: meta.title || file.name || 'Unknown Title',
        artist: meta.artist || 'Unknown Artist',
        image: meta.image || 'assets/placeholder.png',
        fileUrl: URL.createObjectURL(file),
        isLocal: true,
      };
    } catch (error) {
      console.error('Error reading selected file', error);
      return null;
    }
  }

  private async readNativeFileAsBlob(filePath: string): Promise<Blob> {
    const path = filePath.replace(/^file:\/\//, '');
    const parts = path.split('/');
    const fileName = parts.pop()!;
    const dirPath = parts.join('/') + '/';

    const buffer = await this.file.readAsArrayBuffer(dirPath, fileName);
    return new Blob([buffer]);
  }
}
