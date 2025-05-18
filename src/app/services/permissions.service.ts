// services/permissions.service.ts
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  constructor(private alertController: AlertController) {}

  async requestStoragePermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return true; // Web platform doesn't need permission
    }
    
    try {
      // Test if we can access the filesystem
      await Filesystem.readdir({
        path: '/',
        directory: Directory.ExternalStorage
      });
      
      return true;
    } catch (error) {
      // Show alert to request permission
      const alert = await this.alertController.create({
        header: 'Storage Permission Required',
        message: 'This app needs access to your device storage to find and play local music files.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Open Settings',
            handler: () => {
              // In a real app, you would open app settings
              // This requires a Capacitor plugin like App
              return false;
            }
          }
        ]
      });
      
      await alert.present();
      return false;
    }
  }
}