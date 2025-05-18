// app.component.ts
import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private storageService: StorageService
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    
    if (this.platform.is('capacitor')) {
      StatusBar.setBackgroundColor({ color: '#3880ff' });
      SplashScreen.hide();
    }
  }

  async ngOnInit() {
    // Initialize storage
    await this.storageService.init();
    
    // Apply theme based on settings
    const settings = await this.storageService.getSettings();
    if (settings && settings.theme === 'dark') {
      document.body.classList.add('dark');
    }
  }
}