// pages/settings/settings.page.ts
import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { AudioService } from '../../services/audio.service';
import { AppSettings } from '../../models/track.model';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  settings: AppSettings | null = null;
  volume = 1;

  // pages/settings/settings.page.ts (continued)
  constructor(
    private storageService: StorageService,
    private audioService: AudioService,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    // Load settings
    this.settings = await this.storageService.getSettings();
    
    // Subscribe to player state to get volume
    this.audioService.state.subscribe(state => {
      this.volume = state.volume;
    });
  }

  async toggleTheme() {
    if (!this.settings) return;
    
    this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
    await this.storageService.saveSettings(this.settings);
    
    // Apply theme
    document.body.classList.toggle('dark', this.settings.theme === 'dark');
    
    this.showToast(`${this.settings.theme.charAt(0).toUpperCase() + this.settings.theme.slice(1)} theme applied`);
  }

  async toggleEqualizer() {
    if (!this.settings) return;
    
    this.settings.equalizer.enabled = !this.settings.equalizer.enabled;
    await this.storageService.saveSettings(this.settings);
    
    // In a real app, you would apply equalizer settings to the audio
    this.showToast(`Equalizer ${this.settings.equalizer.enabled ? 'enabled' : 'disabled'}`);
  }

  async changeEqualizerPreset(preset: string) {
    if (!this.settings) return;
    
    this.settings.equalizer.currentPreset = preset;
    await this.storageService.saveSettings(this.settings);
    
    // In a real app, you would apply equalizer settings to the audio
    this.showToast(`Equalizer preset changed to ${preset}`);
  }

  async changeAudioQuality(quality: 'low' | 'medium' | 'high') {
    if (!this.settings) return;
    
    this.settings.audioQuality = quality;
    await this.storageService.saveSettings(this.settings);
    
    this.showToast(`Audio quality set to ${quality}`);
  }

  setVolume(event: any) {
    const volume = event.detail.value;
    this.audioService.setVolume(volume);
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}