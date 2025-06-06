import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StreamingPageRoutingModule } from './streaming-routing.module';
import { StreamingPage } from './streaming.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StreamingPageRoutingModule,
    SharedModule
  ],
  declarations: [StreamingPage]
})
export class StreamingPageModule {}
