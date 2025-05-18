import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LocalPageRoutingModule } from './local-routing.module';
import { LocalPage } from './local.page';
import { SharedModule } from '../../shared/shared.module';  // Import SharedModule

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocalPageRoutingModule,
    SharedModule  // Add SharedModule to imports
  ],
  declarations: [LocalPage]  // Remove PlayerComponent from here
})
export class LocalPageModule { }