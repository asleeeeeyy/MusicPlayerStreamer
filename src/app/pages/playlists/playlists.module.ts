import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PlaylistsPageRoutingModule } from './playlists-routing.module';
import { PlaylistsPage } from './playlists.page';
import { SharedModule } from '../../shared/shared.module'; // Check this path

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlaylistsPageRoutingModule,
    SharedModule
  ],
  declarations: [PlaylistsPage]
})
export class PlaylistsPageModule { }
