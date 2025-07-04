import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Track } from '../models/track.model'; // adjust path if needed

@Component({
  selector: 'app-mini-player',
  templateUrl: './mini-player.page.html',
  styleUrls: ['./mini-player.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class MiniPlayerComponent {
  @Input() currentTrack: Track | null = null;
  @Input() isPlaying: boolean = false;
  @Output() playPrevious = new EventEmitter<void>();
  @Output() togglePlayPause = new EventEmitter<void>();
  @Output() playNext = new EventEmitter<void>();
  @Output() goToNowPlaying = new EventEmitter<void>();
}