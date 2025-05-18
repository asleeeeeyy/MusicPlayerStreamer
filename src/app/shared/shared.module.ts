import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PlayerComponent } from '../components/player/player.component';

@NgModule({
  declarations: [PlayerComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    CommonModule,
    IonicModule,
    PlayerComponent
  ]
})
export class SharedModule { }