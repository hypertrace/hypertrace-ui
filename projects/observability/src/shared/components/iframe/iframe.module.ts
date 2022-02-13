import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IFrameComponent } from './iframe.component';

@NgModule({
  declarations: [IFrameComponent],
  imports: [CommonModule],
  exports: [IFrameComponent]
})
export class IFrameModule {}
